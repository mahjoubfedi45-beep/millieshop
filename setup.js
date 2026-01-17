#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Mode Shop E-commerce Platform...\n');

// Create admin user script
const createAdminScript = `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new User({
      name: 'Administrator',
      email: 'admin@modeshop.com',
      password: hashedPassword,
      role: 'admin',
      address: '123 Admin Street',
      phone: '+1234567890'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@modeshop.com');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
`;

// Write the admin creation script
fs.writeFileSync(path.join(__dirname, 'backend', 'createAdmin.js'), createAdminScript);

// Create sample products script
const sampleProductsScript = `
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'T-shirt Premium Coton',
    price: 29.99,
    description: 'T-shirt en coton bio de haute qualité, confortable et durable.',
    category: 'Vêtements',
    stock: 50,
    image: '/uploads/placeholder.jpg'
  },
  {
    name: 'Jean Slim Fit',
    price: 79.99,
    description: 'Jean moderne avec coupe ajustée, parfait pour un look décontracté.',
    category: 'Vêtements',
    stock: 30,
    image: '/uploads/placeholder.jpg'
  },
  {
    name: 'Sneakers Urban',
    price: 89.99,
    description: 'Baskets tendance pour un style urbain et moderne.',
    category: 'Chaussures',
    stock: 25,
    image: '/uploads/placeholder.jpg'
  },
  {
    name: 'Sac à Main Élégant',
    price: 149.99,
    description: 'Sac à main en cuir véritable, élégant et pratique.',
    category: 'Accessoires',
    stock: 15,
    image: '/uploads/placeholder.jpg'
  },
  {
    name: 'Montre Classique',
    price: 199.99,
    description: 'Montre intemporelle avec bracelet en cuir.',
    category: 'Accessoires',
    stock: 20,
    image: '/uploads/placeholder.jpg'
  }
];

const createSampleProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log('Products already exist in database');
      process.exit(0);
    }

    await Product.insertMany(sampleProducts);
    console.log('✅ Sample products created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample products:', error);
    process.exit(1);
  }
};

createSampleProducts();
`;

fs.writeFileSync(path.join(__dirname, 'backend', 'createSampleProducts.js'), sampleProductsScript);

// Create deployment configuration
const deployConfig = `
# Deployment Configuration

## Environment Variables Required:

### Backend (.env)
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_super_secure_jwt_secret_change_in_production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Mode Shop <your.email@gmail.com>

### Frontend (if needed)
REACT_APP_API_URL=http://localhost:5000

## Quick Setup Commands:

1. Install all dependencies:
   npm run install-all

2. Start development servers:
   npm run dev

3. Create admin user:
   cd backend && node createAdmin.js

4. Create sample products:
   cd backend && node createSampleProducts.js

5. Build for production:
   npm run build

## Deployment Checklist:

- [ ] Set up MongoDB database
- [ ] Configure environment variables
- [ ] Set up email service (Gmail App Password)
- [ ] Upload sample product images
- [ ] Create admin user
- [ ] Test all functionality
- [ ] Set up SSL certificate
- [ ] Configure domain name
- [ ] Set up monitoring
- [ ] Configure backups
`;

fs.writeFileSync(path.join(__dirname, 'DEPLOYMENT.md'), deployConfig);

console.log('✅ Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run install-all');
console.log('2. Configure your .env file in the backend directory');
console.log('3. Start MongoDB service');
console.log('4. Run: npm run dev');
console.log('5. Create admin user: cd backend && node createAdmin.js');
console.log('6. Create sample products: cd backend && node createSampleProducts.js');
console.log('\n🎉 Your e-commerce platform is ready to go!');