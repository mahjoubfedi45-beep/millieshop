const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class GitHubStorage {
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
    this.ensureDataExists();
  }

  ensureDataExists() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
    
    // Ensure all JSON files exist with initial data
    const files = {
      'users.json': [
        {
          "_id": "admin-default-id",
          "name": "Admin Millie Shop",
          "email": "admin@millie-shop.com",
          "password": "$2b$10$WV9uQXjuus0P8NPhmUTXY.1AbEWZq8nFh1WI7hQ3SVD4FY2ve/Edq",
          "role": "admin",
          "address": "Tunis, Tunisie",
          "phone": "+216 12 345 678",
          "createdAt": "2026-01-19T16:00:00.000Z"
        }
      ],
      'products.json': [
        {
          "_id": "sample-product-1",
          "name": "Robe Élégante Noire",
          "price": 89.99,
          "description": "Robe élégante parfaite pour toutes les occasions spéciales",
          "category": "Robes",
          "stock": 10,
          "image": "/uploads/sample-robe.jpg",
          "gallery": [],
          "colors": [
            {"name": "Noir", "hex": "#000000"},
            {"name": "Bleu Marine", "hex": "#1e3a8a"}
          ],
          "sizes": [
            {"size": "S", "stock": 3},
            {"size": "M", "stock": 4},
            {"size": "L", "stock": 3}
          ],
          "createdAt": "2026-01-19T16:00:00.000Z"
        },
        {
          "_id": "sample-product-2",
          "name": "Set Coordonné Chic",
          "price": 129.99,
          "description": "Set deux pièces tendance et confortable",
          "category": "Set",
          "stock": 8,
          "image": "/uploads/sample-set.jpg",
          "gallery": [],
          "colors": [
            {"name": "Beige", "hex": "#c8a882"},
            {"name": "Rose Poudré", "hex": "#f8d7da"}
          ],
          "sizes": [
            {"size": "XS", "stock": 2},
            {"size": "S", "stock": 3},
            {"size": "M", "stock": 3}
          ],
          "createdAt": "2026-01-19T16:00:00.000Z"
        }
      ],
      'orders.json': [],
      'favorites.json': []
    };
    
    Object.entries(files).forEach(([filename, defaultData]) => {
      const filePath = path.join(this.dataPath, filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      }
    });
  }

  // Read data from JSON file
  read(collection) {
    try {
      const filePath = path.join(this.dataPath, `${collection}.json`);
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${collection}:`, error);
      return [];
    }
  }

  // Write data to JSON file
  write(collection, data) {
    try {
      const filePath = path.join(this.dataPath, `${collection}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${collection}:`, error);
      return false;
    }
  }

  // Find all documents
  findAll(collection) {
    return this.read(collection);
  }

  // Find one document by criteria
  findOne(collection, criteria) {
    const data = this.read(collection);
    return data.find(item => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    });
  }

  // Find documents by criteria
  find(collection, criteria = {}) {
    const data = this.read(collection);
    if (Object.keys(criteria).length === 0) return data;
    
    return data.filter(item => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    });
  }

  // Insert new document
  insert(collection, document) {
    const data = this.read(collection);
    const newDoc = { 
      _id: uuidv4(), 
      ...document, 
      createdAt: new Date().toISOString() 
    };
    data.push(newDoc);
    this.write(collection, data);
    return newDoc;
  }

  // Update document by ID
  update(collection, id, updates) {
    const data = this.read(collection);
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    this.write(collection, data);
    return data[index];
  }

  // Delete document by ID
  delete(collection, id) {
    const data = this.read(collection);
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return false;
    
    data.splice(index, 1);
    this.write(collection, data);
    return true;
  }

  // Count documents
  count(collection, criteria = {}) {
    return this.find(collection, criteria).length;
  }
}

module.exports = new GitHubStorage();