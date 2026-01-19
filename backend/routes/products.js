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
    
    // Get all products
    let products = Product.findAll();
    
    // Search filter
    if (req.query.search) {
      products = Product.search(req.query.search);
    }
    
    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      products = products.filter(product => 
        product.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      const minPrice = parseFloat(req.query.minPrice) || 0;
      const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
      products = products.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
      );
    }
    
    // Sort
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'name_asc':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        default:
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }
    
    // Get unique categories
    const allProducts = Product.findAll();
    const categories = [...new Set(allProducts.map(p => p.category))];
    
    // Pagination
    const total = products.length;
    const paginatedProducts = products.slice(skip, skip + limit);
    
    res.json({
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasMore: skip + limit < total
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
    const product = Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST créer un nouveau produit (admin seulement)
router.post('/', auth, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category, stock, colors, sizes } = req.body;
    
    const productData = {
      name,
      price: parseFloat(price),
      description,
      category,
      stock: parseInt(stock) || 0,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      colors: colors ? JSON.parse(colors) : [],
      sizes: sizes ? JSON.parse(sizes) : []
    };

    const product = Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT mettre à jour un produit (admin seulement)
router.put('/:id', auth, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category, stock, colors, sizes } = req.body;
    
    const updates = {
      name,
      price: parseFloat(price),
      description,
      category,
      stock: parseInt(stock) || 0,
      colors: colors ? JSON.parse(colors) : [],
      sizes: sizes ? JSON.parse(sizes) : []
    };

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const product = Product.update(req.params.id, updates);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE supprimer un produit (admin seulement)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const deleted = Product.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET produits par catégorie
router.get('/category/:category', async (req, res) => {
  try {
    const products = Product.findByCategory(req.params.category);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;