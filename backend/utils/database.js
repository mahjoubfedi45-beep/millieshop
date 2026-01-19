const { Pool } = require('pg');

class PostgreSQLDB {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/millieshop',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.initTables();
  }

  async initTables() {
    try {
      // Create users table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'client',
          address TEXT DEFAULT '',
          phone VARCHAR(50) DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create products table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          stock INTEGER DEFAULT 0,
          image TEXT,
          gallery JSONB DEFAULT '[]',
          colors JSONB DEFAULT '[]',
          sizes JSONB DEFAULT '[]',
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create orders table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          customer_info JSONB,
          items JSONB NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          shipping_address JSONB,
          payment_method VARCHAR(50) DEFAULT 'cash',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create favorites table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          product_id INTEGER REFERENCES products(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, product_id)
        )
      `);

      // Insert default admin user if not exists
      const adminExists = await this.pool.query(
        'SELECT id FROM users WHERE email = $1',
        ['admin@millie-shop.com']
      );

      if (adminExists.rows.length === 0) {
        await this.pool.query(`
          INSERT INTO users (name, email, password, role, address, phone)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          'Admin Millie Shop',
          'admin@millie-shop.com',
          '$2b$10$WV9uQXjuus0P8NPhmUTXY.1AbEWZq8nFh1WI7hQ3SVD4FY2ve/Edq', // admin123
          'admin',
          'Tunis, Tunisie',
          '+216 12 345 678'
        ]);
      }

      // Insert sample products if table is empty
      const productCount = await this.pool.query('SELECT COUNT(*) FROM products');
      if (parseInt(productCount.rows[0].count) === 0) {
        const sampleProducts = [
          {
            name: 'Robe Élégante Noire',
            price: 89.99,
            description: 'Robe élégante parfaite pour toutes les occasions spéciales. Coupe flatteuse et tissu de qualité premium.',
            category: 'Robes',
            stock: 10,
            image: 'https://images.unsplash.com/photo-1566479179817-c0ae8e5b4b8e?w=400',
            colors: JSON.stringify([
              {"name": "Noir", "hex": "#000000"},
              {"name": "Bleu Marine", "hex": "#1e3a8a"}
            ]),
            sizes: JSON.stringify([
              {"size": "S", "stock": 3},
              {"size": "M", "stock": 4},
              {"size": "L", "stock": 3}
            ])
          },
          {
            name: 'Set Coordonné Chic',
            price: 129.99,
            description: 'Set deux pièces tendance et confortable. Parfait pour un look décontracté-chic.',
            category: 'Set',
            stock: 8,
            image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
            colors: JSON.stringify([
              {"name": "Beige", "hex": "#c8a882"},
              {"name": "Rose Poudré", "hex": "#f8d7da"}
            ]),
            sizes: JSON.stringify([
              {"size": "XS", "stock": 2},
              {"size": "S", "stock": 3},
              {"size": "M", "stock": 3}
            ])
          },
          {
            name: 'Nouvelle Collection - Robe Florale',
            price: 99.99,
            description: 'Découvrez notre nouvelle collection avec cette magnifique robe à motifs floraux.',
            category: 'Nouvelle Collection',
            stock: 12,
            image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
            colors: JSON.stringify([
              {"name": "Floral Multicolore", "hex": "#ff6b9d"},
              {"name": "Blanc Cassé", "hex": "#faf9f6"}
            ]),
            sizes: JSON.stringify([
              {"size": "XS", "stock": 2},
              {"size": "S", "stock": 4},
              {"size": "M", "stock": 4},
              {"size": "L", "stock": 2}
            ])
          }
        ];

        for (const product of sampleProducts) {
          await this.pool.query(`
            INSERT INTO products (name, price, description, category, stock, image, colors, sizes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            product.name,
            product.price,
            product.description,
            product.category,
            product.stock,
            product.image,
            product.colors,
            product.sizes
          ]);
        }
      }

      console.log('✅ PostgreSQL tables initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing PostgreSQL tables:', error);
    }
  }

  // Generic query method
  async query(text, params) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Users
  async createUser(userData) {
    const { name, email, password, role = 'client', address = '', phone = '' } = userData;
    const result = await this.query(
      'INSERT INTO users (name, email, password, role, address, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, password, role, address, phone]
    );
    return result.rows[0];
  }

  async findUserByEmail(email) {
    const result = await this.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async findUserById(id) {
    const result = await this.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Products
  async createProduct(productData) {
    const { name, price, description, category, stock, image, colors, sizes } = productData;
    const result = await this.query(
      'INSERT INTO products (name, price, description, category, stock, image, colors, sizes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, price, description, category, stock, image, JSON.stringify(colors), JSON.stringify(sizes)]
    );
    return result.rows[0];
  }

  async getAllProducts() {
    const result = await this.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
  }

  async getProductById(id) {
    const result = await this.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  }

  async updateProduct(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'colors' || key === 'sizes') {
        fields.push(`${key} = $${paramCount}`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
      paramCount++;
    });

    values.push(id);
    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async deleteProduct(id) {
    await this.query('DELETE FROM products WHERE id = $1', [id]);
    return true;
  }

  // Orders
  async createOrder(orderData) {
    const { user_id, customer_info, items, total, shipping_address, payment_method } = orderData;
    const result = await this.query(
      'INSERT INTO orders (user_id, customer_info, items, total, shipping_address, payment_method) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, JSON.stringify(customer_info), JSON.stringify(items), total, JSON.stringify(shipping_address), payment_method]
    );
    return result.rows[0];
  }

  async getAllOrders() {
    const result = await this.query('SELECT * FROM orders ORDER BY created_at DESC');
    return result.rows;
  }

  async getOrdersByUser(userId) {
    const result = await this.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  async updateOrderStatus(id, status) {
    const result = await this.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    return result.rows[0];
  }

  // Favorites
  async createFavorite(userId, productId) {
    const result = await this.query(
      'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) ON CONFLICT (user_id, product_id) DO NOTHING RETURNING *',
      [userId, productId]
    );
    return result.rows[0];
  }

  async getFavoritesByUser(userId) {
    const result = await this.query(`
      SELECT f.*, p.name, p.price, p.image 
      FROM favorites f 
      JOIN products p ON f.product_id = p.id 
      WHERE f.user_id = $1
    `, [userId]);
    return result.rows;
  }

  async deleteFavorite(userId, productId) {
    await this.query('DELETE FROM favorites WHERE user_id = $1 AND product_id = $2', [userId, productId]);
    return true;
  }
}

module.exports = new PostgreSQLDB();