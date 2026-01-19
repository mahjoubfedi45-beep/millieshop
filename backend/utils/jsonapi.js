// Simple JSON API Database - Works for EVERYONE
class JSONApiDB {
  constructor() {
    this.baseUrl = 'https://jsonplaceholder.typicode.com';
    this.products = [
      {
        id: 1,
        name: 'Robe Élégante Noire',
        price: 89.99,
        description: 'Robe élégante parfaite pour toutes les occasions spéciales. Coupe flatteuse et tissu de qualité premium.',
        category: 'Robes',
        stock: 10,
        image: 'https://images.unsplash.com/photo-1566479179817-c0ae8e5b4b8e?w=400',
        colors: [
          {"name": "Noir", "hex": "#000000"},
          {"name": "Bleu Marine", "hex": "#1e3a8a"}
        ],
        sizes: [
          {"size": "S", "stock": 3},
          {"size": "M", "stock": 4},
          {"size": "L", "stock": 3}
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Set Coordonné Chic',
        price: 129.99,
        description: 'Set deux pièces tendance et confortable. Parfait pour un look décontracté-chic.',
        category: 'Set',
        stock: 8,
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
        colors: [
          {"name": "Beige", "hex": "#c8a882"},
          {"name": "Rose Poudré", "hex": "#f8d7da"}
        ],
        sizes: [
          {"size": "XS", "stock": 2},
          {"size": "S", "stock": 3},
          {"size": "M", "stock": 3}
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Nouvelle Collection - Robe Florale',
        price: 99.99,
        description: 'Découvrez notre nouvelle collection avec cette magnifique robe à motifs floraux.',
        category: 'Nouvelle Collection',
        stock: 12,
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
        colors: [
          {"name": "Floral Multicolore", "hex": "#ff6b9d"},
          {"name": "Blanc Cassé", "hex": "#faf9f6"}
        ],
        sizes: [
          {"size": "XS", "stock": 2},
          {"size": "S", "stock": 4},
          {"size": "M", "stock": 4},
          {"size": "L", "stock": 2}
        ],
        created_at: new Date().toISOString()
      }
    ];
    
    this.users = [
      {
        id: 1,
        name: 'Admin Millie Shop',
        email: 'admin@millie-shop.com',
        password: '$2b$10$WV9uQXjuus0P8NPhmUTXY.1AbEWZq8nFh1WI7hQ3SVD4FY2ve/Edq',
        role: 'admin',
        address: 'Tunis, Tunisie',
        phone: '+216 12 345 678',
        created_at: new Date().toISOString()
      }
    ];
    
    this.orders = [];
    this.favorites = [];
    
    console.log('✅ JSON API Database initialized with sample data');
  }

  // Users
  async createUser(userData) {
    const newUser = {
      id: this.users.length + 1,
      ...userData,
      created_at: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  async findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  async findUserById(id) {
    return this.users.find(user => user.id === parseInt(id));
  }

  // Products
  async createProduct(productData) {
    const newProduct = {
      id: this.products.length + 1,
      ...productData,
      created_at: new Date().toISOString()
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async getAllProducts() {
    return this.products;
  }

  async getProductById(id) {
    return this.products.find(product => product.id === parseInt(id));
  }

  async updateProduct(id, updates) {
    const index = this.products.findIndex(product => product.id === parseInt(id));
    if (index === -1) return null;
    
    this.products[index] = { ...this.products[index], ...updates };
    return this.products[index];
  }

  async deleteProduct(id) {
    const index = this.products.findIndex(product => product.id === parseInt(id));
    if (index === -1) return false;
    
    this.products.splice(index, 1);
    return true;
  }

  // Orders
  async createOrder(orderData) {
    const newOrder = {
      id: this.orders.length + 1,
      ...orderData,
      created_at: new Date().toISOString()
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  async getAllOrders() {
    return this.orders;
  }

  async getOrdersByUser(userId) {
    return this.orders.filter(order => order.user_id === userId);
  }

  async updateOrderStatus(id, status) {
    const index = this.orders.findIndex(order => order.id === parseInt(id));
    if (index === -1) return null;
    
    this.orders[index].status = status;
    return this.orders[index];
  }

  // Favorites
  async createFavorite(userId, productId) {
    const newFavorite = {
      id: this.favorites.length + 1,
      user_id: userId,
      product_id: productId,
      created_at: new Date().toISOString()
    };
    this.favorites.push(newFavorite);
    return newFavorite;
  }

  async getFavoritesByUser(userId) {
    const userFavorites = this.favorites.filter(fav => fav.user_id === userId);
    return userFavorites.map(fav => {
      const product = this.products.find(p => p.id === fav.product_id);
      return {
        ...fav,
        products: product
      };
    });
  }

  async deleteFavorite(userId, productId) {
    const index = this.favorites.findIndex(fav => 
      fav.user_id === userId && fav.product_id === productId
    );
    if (index === -1) return false;
    
    this.favorites.splice(index, 1);
    return true;
  }
}

module.exports = new JSONApiDB();