const db = require('../utils/database');

class Favorite {
  static async create(favoriteData) {
    return await db.createFavorite(favoriteData.user, favoriteData.product);
  }

  static async findByUser(userId) {
    return await db.getFavoritesByUser(userId);
  }

  static async findByUserAndProduct(userId, productId) {
    const result = await db.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    return result.rows[0];
  }

  static async deleteByUserAndProduct(userId, productId) {
    return await db.deleteFavorite(userId, productId);
  }
}

module.exports = Favorite;