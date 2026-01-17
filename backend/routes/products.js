const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const { auth, isAdmin } = require('../middleware/auth');

// Configuration Multer pour upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Erreur: Images seulement!');
    }
  }
});

// GET tous les produits avec pagination, recherche et filtres
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Construire la requête de recherche
    let query = {};
    
    // Recherche par nom
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    // Filtre par catégorie
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }
    
    // Filtre par prix
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }
    
    // Tri
    let sort = { createdAt: -1 };
    if (req.query.sort === 'price_asc') {
      sort = { price: 1 };
    } else if (req.query.sort === 'price_desc') {
      sort = { price: -1 };
    } else if (req.query.sort === 'name_asc') {
      sort = { name: 1 };
    }
    
    // Exécuter la requête
    const products = await Product.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip);
    
    const total = await Product.countDocuments(query);
    
    // Obtenir toutes les catégories uniques
    const categories = await Product.distinct('category');
    
    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasMore: skip + products.length < total
      },
      categories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST créer un produit (admin seulement)
router.post('/', auth, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      colors: req.body.colors ? JSON.parse(req.body.colors) : [],
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : []
    };

    const product = new Product(productData);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT mettre à jour un produit (admin seulement)
router.put('/:id', auth, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
      colors: req.body.colors ? JSON.parse(req.body.colors) : [],
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : []
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE supprimer un produit (admin seulement)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;