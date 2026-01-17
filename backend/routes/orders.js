const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');

// Obtenir les commandes de l'utilisateur connecté
router.get('/my-orders', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir une commande spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image category')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier que l'utilisateur peut voir cette commande
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Annuler une commande (utilisateur)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ message: 'Cette commande ne peut plus être annulée' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Commande annulée avec succès', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ROUTES ADMIN

// Obtenir toutes les commandes (admin)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Filtres
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    
    if (req.query.search) {
      query.$or = [
        { 'shippingAddress.city': { $regex: req.query.search, $options: 'i' } },
        { trackingNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(query);

    // Statistiques
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      },
      stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour le statut d'une commande (admin)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    const updateData = { status };
    
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;
    
    // Mettre à jour les dates selon le statut
    if (status === 'shipped' && !order.shippingDate) {
      updateData.shippingDate = new Date();
    } else if (status === 'delivered' && !order.deliveryDate) {
      updateData.deliveryDate = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    res.json({ message: 'Commande mise à jour', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer une commande (admin)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.json({ message: 'Commande supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;