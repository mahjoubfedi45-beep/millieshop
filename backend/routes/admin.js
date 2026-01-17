const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');

// Dashboard statistics
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts,
      monthlyStats
    ] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { 
          _id: '$items.product', 
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }},
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: { 
          from: 'products', 
          localField: '_id', 
          foreignField: '_id', 
          as: 'product' 
        }},
        { $unwind: '$product' }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$total' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    // Order status distribution
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
      .sort({ stock: 1 })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        monthlyStats
      },
      recentOrders,
      topProducts,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User management
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.patch('/users/:id/role', auth, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['client', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Rôle mis à jour', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk operations
router.post('/products/bulk-update', auth, isAdmin, async (req, res) => {
  try {
    const { productIds, updates } = req.body;
    
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      updates
    );

    res.json({ 
      message: `${result.modifiedCount} produits mis à jour`,
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/products/bulk-delete', auth, isAdmin, async (req, res) => {
  try {
    const { productIds } = req.body;
    
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    res.json({ 
      message: `${result.deletedCount} produits supprimés`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export data
router.get('/export/orders', auth, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name category')
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvData = orders.map(order => ({
      orderId: order._id,
      customerName: order.user?.name || 'N/A',
      customerEmail: order.user?.email || 'N/A',
      total: order.total,
      status: order.status,
      itemsCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
      shippingCity: order.shippingAddress?.city || 'N/A'
    }));

    res.json({ data: csvData, count: csvData.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// System settings
router.get('/settings', auth, isAdmin, async (req, res) => {
  try {
    // In a real app, you'd store these in a settings collection
    const settings = {
      siteName: 'Mode Shop',
      currency: 'EUR',
      taxRate: 0.20,
      shippingCost: 0,
      freeShippingThreshold: 50,
      maintenanceMode: false,
      allowRegistration: true,
      emailNotifications: true
    };

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/settings', auth, isAdmin, async (req, res) => {
  try {
    // In a real app, you'd update the settings in database
    const updatedSettings = req.body;
    
    // Validate settings here
    res.json({ 
      message: 'Paramètres mis à jour',
      settings: updatedSettings 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;