const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

// Ingest customer data
router.post('/', auth, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all customers
router.get('/', auth, async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

module.exports = router;
