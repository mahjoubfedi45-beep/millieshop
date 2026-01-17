const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// POST créer une commande
router.post('/', async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json(order);
});

// GET toutes les commandes (admin)
router.get('/', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
