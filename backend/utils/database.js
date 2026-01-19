const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class SimpleDB {
  constructor() {
    this.dbPath = path.join(__dirname, '../database');
    this.ensureDbExists();
  }

  ensureDbExists() {
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }
    
    // Ensure all JSON files exist
    const files = ['users.json', 'products.json', 'orders.json', 'favorites.json'];
    files.forEach(file => {
      const filePath = path.join(this.dbPath, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '[]');
      }
    });
  }

  // Read data from JSON file
  read(collection) {
    try {
      const filePath = path.join(this.dbPath, `${collection}.json`);
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
      const filePath = path.join(this.dbPath, `${collection}.json`);
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

module.exports = new SimpleDB();