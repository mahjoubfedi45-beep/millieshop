const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Configuration email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Créer une commande (guest ou utilisateur connecté)
router.post('/create-order', async (req, res) => {
  try {
    const { items, customerInfo, shippingAddress, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Panier vide' });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email) {
      return res.status(400).json({ message: 'Informations client requises' });
    }

    // Vérifier la disponibilité des produits et calculer le total
    let total = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item._id || item.id);
      if (!product) {
        return res.status(404).json({ message: `Produit ${item.name} non trouvé` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Stock insuffisant pour ${product.name}. Stock disponible: ${product.stock}` 
        });
      }
      
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Créer la commande (avec ou sans utilisateur connecté)
    const orderData = {
      items: orderItems,
      total,
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address
      },
      shippingAddress: shippingAddress || {
        street: customerInfo.address,
        city: customerInfo.city || '',
        country: 'Tunisie'
      },
      paymentMethod: paymentMethod || 'card',
      status: 'pending'
    };

    // Si utilisateur connecté, ajouter l'ID
    if (req.user) {
      orderData.user = req.user._id;
    }

    const order = new Order(orderData);
    await order.save();

    // Mettre à jour le stock des produits
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item._id || item.id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Envoyer email de confirmation
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@alabina-shoes.com',
        to: customerInfo.email,
        subject: `Confirmation de commande #${order._id.toString().slice(-6)}`,
        html: `
          <h2>Merci pour votre commande !</h2>
          <p>Bonjour ${customerInfo.name},</p>
          <p>Votre commande #${order._id.toString().slice(-6)} a été confirmée.</p>
          <h3>Détails de la commande:</h3>
          <ul>
            ${orderItems.map(item => `
              <li>${item.name} x${item.quantity} - ${item.price * item.quantity} TND</li>
            `).join('')}
          </ul>
          <p><strong>Total: ${total} TND</strong></p>
          <p>Nous vous tiendrons informé de l'avancement de votre commande.</p>
          <p>Cordialement,<br>L'équipe Alabina Shoes</p>
        `
      });
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
    }

    res.status(201).json({
      message: 'Commande créée avec succès',
      order: {
        id: order._id,
        total: order.total,
        status: order.status,
        orderNumber: order._id.toString().slice(-6)
      }
    });

  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la commande' });
  }
});

// Simuler un paiement (pour démo)
router.post('/process-payment', auth, async (req, res) => {
  try {
    const { orderId, paymentDetails } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Simulation du traitement de paiement
    // Dans un vrai projet, intégrer Stripe, PayPal, etc.
    const paymentSuccess = Math.random() > 0.1; // 90% de succès

    if (paymentSuccess) {
      order.status = 'paid';
      order.paymentDate = new Date();
      await order.save();

      res.json({
        success: true,
        message: 'Paiement traité avec succès',
        orderId: order._id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Échec du paiement. Veuillez réessayer.'
      });
    }

  } catch (error) {
    console.error('Erreur traitement paiement:', error);
    res.status(500).json({ message: 'Erreur lors du traitement du paiement' });
  }
});

module.exports = router;