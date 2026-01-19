const { createClient } = require('@supabase/supabase-js');

// Using a public demo Supabase instance - WORKS IMMEDIATELY
const supabaseUrl = 'https://rsnibhkhsbfisdxwputy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbmliaGtoc2JmaXNkeHdwdXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU5MzM2NzYsImV4cCI6MjAyMTUwOTY3Nn0.oZh_EzDzDFb8ST_PILbCKzqq5JoKjgWoEE6ezE_QZko';

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseDB {
  constructor() {
    this.initTables();
  }

  async initTables() {
    try {
      console.log('🔄 Initializing Supabase tables...');
      
      // Create sample products if none exist
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      if (!existingProducts || existingProducts.length === 0) {
        const sampleProducts = [
          {
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
            ]
          },
          {
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
            ]
          },
          {
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
            ]
          }
        ];

        for (const product of sampleProducts) {
          await supabase
            .from('products')
            .insert([product]);
        }
        console.log('✅ Sample products created in Supabase');
      }

      // Create admin user if not exists
      const { data: existingAdmin } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'admin@millie-shop.com')
        .single();

      if (!existingAdmin) {
        await supabase
          .from('users')
          .insert([{
            name: 'Admin Millie Shop',
            email: 'admin@millie-shop.com',
            password: '$2b$10$WV9uQXjuus0P8NPhmUTXY.1AbEWZq8nFh1WI7hQ3SVD4FY2ve/Edq',
            role: 'admin',
            address: 'Tunis, Tunisie',
            phone: '+216 12 345 678'
          }]);
        console.log('✅ Admin user created in Supabase');
      }

      console.log('✅ Supabase initialization complete!');
    } catch (error) {
      console.error('❌ Supabase initialization error:', error);
    }
  }

  // Users
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async findUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Products
  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Orders
  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getOrdersByUser(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async updateOrderStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Favorites
  async createFavorite(userId, productId) {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, product_id: productId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getFavoritesByUser(userId) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        products (name, price, image)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  async deleteFavorite(userId, productId) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    
    if (error) throw error;
    return true;
  }
}

module.exports = new SupabaseDB();