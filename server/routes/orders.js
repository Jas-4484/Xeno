const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

// Ingest order data
router.post('/', auth, async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    // Optionally update customer stats
    await Customer.findByIdAndUpdate(order.customer, {
      $inc: { totalSpend: order.amount, visits: 1 },
      $set: { lastActive: new Date() }
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all orders
router.get('/', auth, async (req, res) => {
  const orders = await Order.find().populate('customer');
  res.json(orders);
});

module.exports = router;
