const express = require('express');
const router = express.Router();
const axios = require('axios');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

// Create campaign and initiate delivery
router.post('/', auth, async (req, res) => {
  try {
    const { name, rules, audienceSize, messages } = req.body;
    const campaign = new Campaign({ name, rules, audienceSize, createdBy: req.user.id });
    await campaign.save();
    // Find audience (mock: all customers, replace with rule logic)
    const audience = await Customer.find();

    // Create communication logs with PENDING status and simulate vendor callbacks
    for (const customer of audience) {
      const personalized = (messages && messages[0]) ? messages[0].replace(/\{\{name\}\}/g, customer.name || '') : '';
      const log = await new CommunicationLog({
        campaign: campaign._id,
        customer: customer._id,
        message: personalized,
        status: 'PENDING',
        vendorResponse: '',
      }).save();

      // Simulate vendor delivery callback after a short delay
      (function simulateDelivery(logId, custId) {
        const delay = 500 + Math.floor(Math.random() * 2000);
        setTimeout(async () => {
          try {
            const success = Math.random() < 0.9;
            const status = success ? 'SENT' : 'FAILED';
            const vendorResponse = success ? 'Delivered' : 'Temporary failure';
            // Call our delivery receipt API to update the log (simulated vendor)
            await axios.post(`http://localhost:${process.env.PORT || 5000}/api/delivery/receipt`, {
              logId,
              status,
              vendorResponse
            });
          } catch (err) {
            console.error('Vendor simulation callback failed', err.message || err);
          }
        }, delay);
      })(log._id, customer._id);
    }

    res.status(201).json({ campaignId: campaign._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// List campaigns with stats
router.get('/', auth, async (req, res) => {
  const campaigns = await Campaign.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
  res.json(campaigns);
});

// Get campaign delivery stats
router.get('/:id/stats', auth, async (req, res) => {
  const logs = await CommunicationLog.find({ campaign: req.params.id });
  const sent = logs.filter(l => l.status === 'SENT').length;
  const failed = logs.filter(l => l.status === 'FAILED').length;
  res.json({ sent, failed, audienceSize: logs.length });
});

module.exports = router;
