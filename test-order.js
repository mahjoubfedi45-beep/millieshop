// Test script to create a sample order
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce')
  .then(async () => {
    console.log('✅ Connecté à MongoDB');
    
    // Import models
    const Order = require('./backend/models/Order');
    const Product = require('./backend/models/Product');
    
    // Create a test product first
    const testProduct = new Product({
      name: 'Bottines Test',
      price: 150,
      description: 'Bottines de test pour vérifier les commandes',
      category: 'Bottines',
      stock: 10,
      image: '/uploads/test.jpg'
    });
    
    await testProduct.save();
    console.log('✅ Produit de test créé');
    
    // Create a test order
    const testOrder = new Order({
      customerInfo: {
        name: 'Ahmed Ben Ali',
        email: 'ahmed@test.com',
        phone: '+216 20 123 456',
        address: '15 Rue Habib Bourguiba, Tunis'
      },
      items: [{
        product: testProduct._id,
        name: testProduct.name,
        price: testProduct.price,
        quantity: 2,
        image: testProduct.image
      }],
      total: testProduct.price * 2,
      shippingAddress: {
        street: '15 Rue Habib Bourguiba',
        city: 'Tunis',
        country: 'Tunisie'
      },
      status: 'pending'
    });
    
    await testOrder.save();
    console.log('✅ Commande de test créée');
    console.log('📋 ID de la commande:', testOrder._id);
    console.log('💰 Total:', testOrder.total, 'TND');
    
    process.exit();
  })
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });