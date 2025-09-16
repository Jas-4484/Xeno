const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  message: String,
  status: { type: String, enum: ['SENT', 'FAILED'], default: 'SENT' },
  vendorResponse: String,
  sentAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);
