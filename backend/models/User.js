const db = require('../utils/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    // Hash password before saving
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    return await db.createUser(userData);
  }

  static async findByEmail(email) {
    return await db.findUserByEmail(email);
  }

  static async findById(id) {
    return await db.findUserById(id);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;