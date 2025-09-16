
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL || undefined });
const axios = require('axios');
const auth = require('../middleware/auth');

function parseSuggestions(raw) {
  if (!raw) return [];
  return raw
    .trim()
    .split('\n')
    .map((s) => s.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 5);
}

// AI-driven message suggestions using OpenAI
router.post('/suggest-messages', auth, async (req, res) => {
  const { objective } = req.body;
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    // Validate input
    if (!objective || typeof objective !== 'string' || objective.trim().length === 0) {
      console.warn('AI suggest called without objective in body');
      return res.status(400).json({ message: 'objective is required in request body' });
    }
    // Log presence of key (do not print the key itself)
    console.log('AI suggest: provider=', provider, 'OPENAI key present=', !!apiKey);
    const prompt = `Suggest 3 short, friendly marketing messages for this campaign objective: ${objective}`;
    const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 45000);

    // Provider: OpenAI
    if (provider === 'openai') {
      if (!apiKey) {
        console.warn('OPENAI_API_KEY not set — returning fallback suggestions');
        const fallback = [
          `Hi there — ${objective}. Enjoy 10% off on your next order!`,
          `We miss you! ${objective}. Here's an exclusive offer just for you.`,
          `Special deal: ${objective}. Claim your discount today!`
        ];
        return res.json({ suggestions: fallback, warning: 'OPENAI_API_KEY not set; using fallback suggestions' });
      }

      let raw = '';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const chatResp = await client.chat.completions.create(
          {
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200,
            temperature: 0.7
          },
          { signal: controller.signal }
        );
        raw = (chatResp.choices && chatResp.choices[0] && chatResp.choices[0].message && chatResp.choices[0].message.content) || '';
      } catch (chatErr) {
        console.warn('Chat completions failed, falling back to instruct completions:', chatErr && chatErr.message);
        try {
          const compResp = await client.completions.create(
            {
              model: process.env.OPENAI_FALLBACK_MODEL || 'gpt-3.5-turbo-instruct',
              prompt,
              max_tokens: 120,
              temperature: 0.7
            },
            { signal: controller.signal }
          );
          raw = (compResp.choices && compResp.choices[0] && compResp.choices[0].text) || '';
        } catch (compErr) {
          console.error('Fallback instruct completions also failed:', compErr && compErr.message);
          const msg = (compErr && compErr.message) || '';
          const looksTimeout = /timeout|ETIMEDOUT|abort|ECONNREFUSED|ENETUNREACH|EAI_AGAIN/i.test(msg);
          if (looksTimeout) {
            const fallback = [
              `Hi there — ${objective}. Enjoy 10% off on your next order!`,
              `We miss you! ${objective}. Here's an exclusive offer just for you.`,
              `Special deal: ${objective}. Claim your discount today!`
            ];
            return res.status(200).json({ suggestions: fallback, warning: 'OpenAI timed out; returned fallback suggestions' });
          }
          throw compErr;
        }
      } finally {
        clearTimeout(timer);
      }
      const suggestions = parseSuggestions(raw);
      return res.json({ suggestions });
    }

    // Provider: Ollama (local)
    if (provider === 'ollama') {
      // Local LLM via Ollama
      console.log('AI provider: ollama');
      const base = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
      const model = process.env.OLLAMA_MODEL || 'llama3.1:8b';
      try {
        const resp = await axios.post(`${base}/api/generate`, {
          model,
          prompt,
          stream: false,
          options: { temperature: 0.7, num_predict: 200 }
        }, { timeout: timeoutMs });
        const raw = (resp.data && (resp.data.response || resp.data.output || ''));
        const suggestions = parseSuggestions(raw);
        return res.json({ suggestions, provider: 'ollama' });
      } catch (e) {
        console.error('Ollama error:', e && e.message);
        const msg = (e && e.message) || '';
        const looksConn = /ECONNREFUSED|ENOTFOUND|connect ECONNREFUSED/i.test(msg);
        if (looksConn) {
          return res.status(503).json({ message: 'Ollama not reachable. Start it with "ollama serve" and pull a model (e.g., llama3.1:8b).', error: msg });
        }
        throw e;
      }
    }

    // Provider: Together.ai
    if (provider === 'together') {
      // Together.ai
      console.log('AI provider: together');
      const togetherKey = process.env.TOGETHER_API_KEY;
      if (!togetherKey) return res.status(400).json({ message: 'TOGETHER_API_KEY is required' });
      const model = process.env.TOGETHER_MODEL || 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo';
      try {
        const r = await axios.post('https://api.together.xyz/v1/chat/completions', {
          model, messages: [{ role: 'user', content: prompt }], max_tokens: 200, temperature: 0.7
        }, { headers: { Authorization: `Bearer ${togetherKey}` }, timeout: timeoutMs });
        const raw = (r.data && r.data.choices && r.data.choices[0] && r.data.choices[0].message && r.data.choices[0].message.content) || '';
        const suggestions = parseSuggestions(raw);
        return res.json({ suggestions, provider: 'together' });
      } catch (e) {
        console.error('Together error:', e && (e.response?.data || e.message));
        return res.status(502).json({ message: 'Together request failed', error: e.message });
      }
    }

    // Provider: Hugging Face
    if (provider === 'huggingface') {
      // Hugging Face Inference API
      console.log('AI provider: huggingface');
      const hfKey = process.env.HUGGINGFACE_API_KEY;
      if (!hfKey) return res.status(400).json({ message: 'HUGGINGFACE_API_KEY is required' });
      const model = process.env.HF_MODEL || 'google/flan-t5-base';
      try {
        const r = await axios.post(`https://api-inference.huggingface.co/models/${model}`,
          { inputs: prompt, parameters: { max_new_tokens: 120, temperature: 0.7 } },
          { headers: { Authorization: `Bearer ${hfKey}` }, timeout: timeoutMs }
        );
        let raw = '';
        if (Array.isArray(r.data) && r.data[0]?.generated_text) raw = r.data[0].generated_text;
        else if (typeof r.data === 'object' && r.data.generated_text) raw = r.data.generated_text;
        else raw = JSON.stringify(r.data);
        const suggestions = parseSuggestions(raw);
        return res.json({ suggestions, provider: 'huggingface' });
      } catch (e) {
        console.error('HuggingFace error:', e && (e.response?.data || e.message));
        return res.status(502).json({ message: 'HuggingFace request failed', error: e.message });
      }
    }

    // Provider: Azure OpenAI
    if (provider === 'azure') {
      console.log('AI provider: azure-openai');
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT; // e.g., https://your-resource.openai.azure.com
      const key = process.env.AZURE_OPENAI_API_KEY;
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT; // your deployment name
      const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
      if (!endpoint || !key || !deployment) {
        return res.status(400).json({ message: 'AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT are required' });
      }
      try {
        const r = await axios.post(
          `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
          { messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 200 },
          { headers: { 'api-key': key }, timeout: timeoutMs }
        );
        const raw = (r.data && r.data.choices && r.data.choices[0] && r.data.choices[0].message && r.data.choices[0].message.content) || '';
        const suggestions = parseSuggestions(raw);
        return res.json({ suggestions, provider: 'azure' });
      } catch (e) {
        console.error('Azure OpenAI error:', e && (e.response?.data || e.message));
        return res.status(502).json({ message: 'Azure OpenAI request failed', error: e.message });
      }
    }

    // Unknown provider
    return res.status(400).json({ message: `Unknown AI_PROVIDER: ${provider}` });
  } catch (err) {
    // Enhanced error logging for axios/OpenAI errors
    try {
      if (err.response) {
        console.error('OpenAI HTTP error status:', err.response.status);
        console.error('OpenAI response headers:', err.response.headers);
        console.error('OpenAI response data:', JSON.stringify(err.response.data));
      } else if (err.request) {
        console.error('No response received from OpenAI, request made:', err.request && err.request._header ? '(has headers)' : '(no header)');
      } else {
        console.error('Axios error (no response/request):', err.message);
      }
    } catch (loggingError) {
      console.error('Error while logging OpenAI error details:', loggingError);
    }
    console.error('AI suggestion error stack:', err.stack || err);
    const errorMsg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
    res.status(500).json({ message: 'AI suggestion failed', error: errorMsg });
  }
});

module.exports = router;
