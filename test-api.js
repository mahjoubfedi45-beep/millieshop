// Test de l'API des commandes
const fetch = require('node-fetch');

async function testOrdersAPI() {
  try {
    console.log('🧪 Test de l\'API des commandes...');
    
    // D'abord, se connecter en tant qu'admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@shop.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Échec de la connexion admin');
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Connexion admin réussie');
    
    // Maintenant, récupérer les commandes
    const ordersResponse = await fetch('http://localhost:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!ordersResponse.ok) {
      console.error('❌ Échec de récupération des commandes:', ordersResponse.status);
      const errorText = await ordersResponse.text();
      console.error('Erreur:', errorText);
      return;
    }
    
    const ordersData = await ordersResponse.json();
    console.log('✅ Commandes récupérées:', ordersData.orders?.length || 0);
    
    if (ordersData.orders && ordersData.orders.length > 0) {
      console.log('📋 Première commande:');
      const firstOrder = ordersData.orders[0];
      console.log('- ID:', firstOrder._id);
      console.log('- Client:', firstOrder.customerInfo?.name);
      console.log('- Total:', firstOrder.total, 'TND');
      console.log('- Statut:', firstOrder.status);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testOrdersAPI();