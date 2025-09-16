const express = require('express');
const router = express.Router();
const CommunicationLog = require('../models/CommunicationLog');

// Delivery receipt API (called by vendor API)
router.post('/receipt', async (req, res) => {
  const { logId, status, vendorResponse } = req.body;
  try {
    await CommunicationLog.findByIdAndUpdate(logId, {
      status,
      vendorResponse,
      updatedAt: new Date()
    });
    res.json({ message: 'Delivery status updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
