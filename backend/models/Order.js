const db = require('../utils/database');

class Order {
  static async create(orderData) {
    return await db.createOrder(orderData);
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUser(userId) {
    return await db.getOrdersByUser(userId);
  }

  static async findAll() {
    return await db.getAllOrders();
  }

  static async updateStatus(id, status) {
    return await db.updateOrderStatus(id, status);
  }
}

module.exports = Order;