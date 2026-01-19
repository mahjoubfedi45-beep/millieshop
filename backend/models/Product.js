const db = require('../utils/githubStorage');

class Product {
  static create(productData) {
    const product = {
      name: productData.name,
      price: parseFloat(productData.price),
      description: productData.description || '',
      category: productData.category || 'Autre',
      stock: parseInt(productData.stock) || 0,
      image: productData.image || '',
      gallery: productData.gallery || [],
      colors: productData.colors || [],
      sizes: productData.sizes || [],
      featured: productData.featured || false
    };
    
    return db.insert('products', product);
  }

  static findById(id) {
    return db.findOne('products', { _id: id });
  }

  static findByCategory(category) {
    return db.find('products', { category });
  }

  static findAll() {
    return db.findAll('products');
  }

  static update(id, updates) {
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.stock) updates.stock = parseInt(updates.stock);
    return db.update('products', id, updates);
  }

  static delete(id) {
    return db.delete('products', id);
  }

  static count(criteria = {}) {
    return db.count('products', criteria);
  }

  static search(query) {
    const products = db.findAll('products');
    return products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
  }
}

module.exports = Product;