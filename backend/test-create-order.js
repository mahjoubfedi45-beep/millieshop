const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce')
  .then(async () => {
    console.log('✅ Connecté à MongoDB');
    
    // Créer une commande de test
    const testOrder = new Order({
      customerInfo: {
        name: 'Ahmed Ben Ali',
        email: 'ahmed@test.com',
        phone: '+216 20 123 456',
        address: '15 Rue Habib Bourguiba, Tunis'
      },
      items: [{
        product: new mongoose.Types.ObjectId(),
        name: 'Bottines Élégantes',
        price: 150,
        quantity: 2,
        image: '/uploads/test.jpg'
      }],
      total: 300,
      shippingAddress: {
        street: '15 Rue Habib Bourguiba',
        city: 'Tunis',
        country: 'Tunisie'
      },
      status: 'pending'
    });
    
    await testOrder.save();
    console.log('✅ Commande de test créée');
    console.log('📋 ID:', testOrder._id);
    console.log('👤 Client:', testOrder.customerInfo.name);
    console.log('💰 Total:', testOrder.total, 'TND');
    
    // Vérifier que la commande existe
    const orders = await Order.find({});
    console.log(`📊 Total des commandes dans la DB: ${orders.length}`);
    
    process.exit();
  })
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });