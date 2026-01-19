const db = require('../utils/jsonapi');

class Favorite {
  static async create(favoriteData) {
    return await db.createFavorite(favoriteData.user, favoriteData.product);
  }

  static async findByUser(userId) {
    return await db.getFavoritesByUser(userId);
  }

  static async findByUserAndProduct(userId, productId) {
    const favorites = await db.getFavoritesByUser(userId);
    return favorites.find(f => f.product_id === productId);
  }

  static async deleteByUserAndProduct(userId, productId) {
    return await db.deleteFavorite(userId, productId);
  }
}

module.exports = Favorite;