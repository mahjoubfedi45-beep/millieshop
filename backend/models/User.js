const bcrypt = require('bcryptjs');
const db = require('../utils/githubStorage');

class User {
  static async create(userData) {
    // Hash password before saving
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const user = {
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role: userData.role || 'client',
      address: userData.address || '',
      phone: userData.phone || ''
    };
    
    return db.insert('users', user);
  }

  static findByEmail(email) {
    return db.findOne('users', { email: email.toLowerCase() });
  }

  static findById(id) {
    return db.findOne('users', { _id: id });
  }

  static findByRole(role) {
    return db.find('users', { role });
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static update(id, updates) {
    return db.update('users', id, updates);
  }

  static delete(id) {
    return db.delete('users', id);
  }

  static count(criteria = {}) {
    return db.count('users', criteria);
  }

  static findAll() {
    return db.findAll('users');
  }
}

module.exports = User;