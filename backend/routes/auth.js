const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise_changez_moi';

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer l'utilisateur
    const user = User.create({
      name,
      email,
      password,
      address,
      phone,
      role: 'client'
    });

    // Créer le token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Créer le token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      address: req.user.address,
      phone: req.user.phone,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour créer un admin (à utiliser une seule fois)
router.post('/create-admin', async (req, res) => {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmins = User.findByRole('admin');
    if (existingAdmins.length > 0) {
      return res.status(400).json({ message: 'Un administrateur existe déjà' });
    }

    // Créer l'admin avec des identifiants par défaut
    const admin = User.create({
      name: 'Admin Millie Shop',
      email: 'admin@millie-shop.com',
      password: 'admin123',
      role: 'admin',
      address: 'Tunis, Tunisie',
      phone: '+216 12 345 678'
    });

    res.status(201).json({
      message: 'Administrateur créé avec succès',
      admin: {
        email: 'admin@millie-shop.com',
        password: 'admin123',
        note: 'Changez ce mot de passe après la première connexion'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;