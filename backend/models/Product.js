const db = require('../utils/supabase');

class Product {
  static async create(productData) {
    return await db.createProduct(productData);
  }

  static async findById(id) {
    return await db.getProductById(id);
  }

  static async findAll() {
    return await db.getAllProducts();
  }

  static async update(id, updates) {
    return await db.updateProduct(id, updates);
  }

  static async delete(id) {
    return await db.deleteProduct(id);
  }

  static async search(query) {
    const products = await db.getAllProducts();
    return products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
  }
}

module.exports = Product;