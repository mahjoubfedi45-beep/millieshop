const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { auth } = require('../middleware/auth');

// GET tous les favoris de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.userId })
      .populate('product')
      .sort({ createdAt: -1 });
    
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST ajouter un favori
router.post('/', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    // Vérifier si déjà en favori
    const existingFavorite = await Favorite.findOne({
      user: req.userId,
      product: productId
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Produit déjà en favoris' });
    }

    const favorite = new Favorite({
      user: req.userId,
      product: productId
    });

    await favorite.save();
    const populatedFavorite = await Favorite.findById(favorite._id).populate('product');
    
    res.status(201).json(populatedFavorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE retirer un favori
router.delete('/:productId', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.userId,
      product: req.params.productId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }

    res.json({ message: 'Favori retiré' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;