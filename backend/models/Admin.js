const db = require('../utils/jsonapi');

class Admin {
  static async findByEmail(email) {
    const user = await db.findUserByEmail(email);
    return user && user.role === 'admin' ? user : null;
  }

  static async findById(id) {
    const user = await db.findUserById(id);
    return user && user.role === 'admin' ? user : null;
  }

  static async findAll() {
    const users = await db.users || [];
    return users.filter(user => user.role === 'admin');
  }
}

module.exports = Admin;
