const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlVTRVJfSUQiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTczMjUwOTQsImV4cCI6MTc1NzkyOTg5NH0.IHQX7uvMamZTt6PKYQc0MqKVUUufRi6TTTXsLAwgbOk";
const token = jwt.sign({ id: 'TEST_USER', email: 'test@local' }, JWT_SECRET, { expiresIn: '7d' });

(async () => {
  try {
    console.log('Using token:', token);
    const res = await axios.post('http://localhost:5000/api/ai/suggest-messages', { objective: 'bring back inactive users' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Response status:', res.status);
    console.log('Body:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response status:', err.response.status);
      console.error('Error response data:', err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
  }
})();
