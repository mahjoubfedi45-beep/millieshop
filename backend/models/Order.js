const db = require('../utils/supabase');

class Order {
  static async create(orderData) {
    return await db.createOrder(orderData);
  }

  static async findById(id) {
    return await db.getOrderById(id);
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