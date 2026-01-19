const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');

// Obtenir toutes les commandes (admin) ou les commandes de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    let orders;
    
    if (req.user.role === 'admin') {
      // Admin voit toutes les commandes
      orders = Order.findAll();
    } else {
      // Utilisateur voit ses commandes
      orders = Order.findByUser(req.user._id);
    }
    
    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      orders,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalOrders: orders.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir une commande spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const order = Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier que l'utilisateur peut voir cette commande
    if (order.user !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer une nouvelle commande
router.post('/', async (req, res) => {
  try {
    const { customerInfo, items, total, shippingAddress, paymentMethod } = req.body;
    
    const orderData = {
      user: req.user ? req.user._id : null,
      customerInfo,
      items,
      total: parseFloat(total),
      shippingAddress,
      paymentMethod: paymentMethod || 'cash',
      status: 'pending'
    };

    const order = Order.create(orderData);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour le statut d'une commande (admin seulement)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const order = Order.updateStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer une commande (admin seulement)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const deleted = Order.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;