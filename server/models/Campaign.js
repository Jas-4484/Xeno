const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: String,
  rules: Object, // JSON logic for audience segmentation
  audienceSize: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
