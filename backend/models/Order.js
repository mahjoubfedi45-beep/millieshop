const db = require('../utils/database');

class Order {
  static create(orderData) {
    const order = {
      user: orderData.user || null,
      customerInfo: orderData.customerInfo,
      items: orderData.items || [],
      total: parseFloat(orderData.total) || 0,
      status: orderData.status || 'pending',
      shippingAddress: orderData.shippingAddress || {},
      paymentMethod: orderData.paymentMethod || 'cash'
    };
    
    return db.insert('orders', order);
  }

  static findById(id) {
    return db.findOne('orders', { _id: id });
  }

  static findByUser(userId) {
    return db.find('orders', { user: userId });
  }

  static findAll() {
    return db.findAll('orders');
  }

  static update(id, updates) {
    if (updates.total) updates.total = parseFloat(updates.total);
    return db.update('orders', id, updates);
  }

  static delete(id) {
    return db.delete('orders', id);
  }

  static count(criteria = {}) {
    return db.count('orders', criteria);
  }

  static updateStatus(id, status) {
    return db.update('orders', id, { status });
  }
}

module.exports = Order;