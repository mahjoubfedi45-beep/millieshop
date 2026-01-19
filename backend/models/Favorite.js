const db = require('../utils/database');

class Favorite {
  static create(favoriteData) {
    const favorite = {
      user: favoriteData.user,
      product: favoriteData.product
    };
    
    return db.insert('favorites', favorite);
  }

  static findByUser(userId) {
    return db.find('favorites', { user: userId });
  }

  static findByUserAndProduct(userId, productId) {
    return db.findOne('favorites', { user: userId, product: productId });
  }

  static delete(id) {
    return db.delete('favorites', id);
  }

  static deleteByUserAndProduct(userId, productId) {
    const favorites = db.findAll('favorites');
    const favorite = favorites.find(f => f.user === userId && f.product === productId);
    if (favorite) {
      return db.delete('favorites', favorite._id);
    }
    return false;
  }
}

module.exports = Favorite;