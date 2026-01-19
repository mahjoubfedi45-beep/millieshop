const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// Obtenir les favoris de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const favorites = Favorite.findByUser(req.user._id);
    
    // Get product details for each favorite
    const favoritesWithProducts = favorites.map(fav => {
      const product = Product.findById(fav.product);
      return {
        ...fav,
        product: product
      };
    }).filter(fav => fav.product); // Remove favorites with deleted products
    
    res.json(favoritesWithProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ajouter un produit aux favoris
router.post('/', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Vérifier si le produit existe
    const product = Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }
    
    // Vérifier si déjà en favoris
    const existingFavorite = Favorite.findByUserAndProduct(req.user._id, productId);
    if (existingFavorite) {
      return res.status(400).json({ message: 'Produit déjà en favoris' });
    }
    
    const favorite = Favorite.create({
      user: req.user._id,
      product: productId
    });
    
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer un produit des favoris
router.delete('/:productId', auth, async (req, res) => {
  try {
    const deleted = Favorite.deleteByUserAndProduct(req.user._id, req.params.productId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }
    
    res.json({ message: 'Produit retiré des favoris' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vérifier si un produit est en favoris
router.get('/check/:productId', auth, async (req, res) => {
  try {
    const favorite = Favorite.findByUserAndProduct(req.user._id, req.params.productId);
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;