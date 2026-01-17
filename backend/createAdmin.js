const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  address: String,
  phone: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce')
  .then(async () => {
    console.log('✅ Connecté à MongoDB');
    
    // Supprimer l'ancien admin s'il existe
    await User.deleteOne({ email: 'admin@shop.com' });
    
    // Créer le hash du mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Créer le nouvel admin
    const admin = new User({
      name: 'Administrateur',
      email: 'admin@shop.com',
      password: hashedPassword,
      role: 'admin',
      address: '',
      phone: '',
      createdAt: new Date()
    });
    
    await admin.save();
    
    console.log('✅ Admin créé avec succès!');
    console.log('📧 Email: admin@shop.com');
    console.log('🔑 Mot de passe: admin123');
    
    process.exit();
  })
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });