import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import './AdminPanel.css';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [adminToken, setAdminToken] = useState(null);
  
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState(['Robes', 'Set', 'Nouvelle Collection']);
  const [loading, setLoading] = useState(false);
  
  // États pour les formulaires
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    image: null,
    colors: [],
    sizes: []
  });
  
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Millie Shop',
    heroTitle: 'Millie Shop',
    heroSubtitle: 'Mode Féminine & Élégance',
    aboutText: '',
    aboutImage: '',
    aboutTitle: 'À Propos de Nous',
    aboutDescription: 'Chez Millie Shop, nous sommes passionnés par la mode féminine et nous nous engageons à offrir des vêtements qui allient style, qualité et élégance. Depuis notre création, nous sélectionnons avec soin chaque pièce de notre collection pour vous offrir le meilleur de la mode contemporaine.',
    aboutFeatures: [
      {
        icon: '👗',
        title: 'Style Unique',
        description: 'Des créations exclusives qui reflètent votre personnalité'
      },
      {
        icon: '⭐',
        title: 'Qualité Premium',
        description: 'Matières nobles et finitions soignées'
      },
      {
        icon: '🚚',
        title: 'Livraison Rapide',
        description: 'Livraison gratuite en Tunisie sous 48h'
      }
    ],
    homeCategories: [
      { name: 'Robes', image: '', description: 'Robes élégantes pour toutes les occasions' },
      { name: 'Set', image: '', description: 'Sets coordonnés tendance et chic' },
      { name: 'Nouvelle Collection', image: '', description: 'Découvrez nos dernières créations' }
    ]
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [newCategory, setNewCategory] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!adminToken) {
      console.log('Pas de token admin disponible');
      return;
    }
    
    try {
      console.log('🔄 Récupération des commandes...');
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Commandes récupérées:', data);
        setOrders(data.orders || []);
      } else {
        console.error('❌ Erreur lors de la récupération des commandes:', response.status);
        const errorText = await response.text();
        console.error('Détails de l\'erreur:', errorText);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
    }
  }, [adminToken]);

  useEffect(() => {
    // Vérifier si l'admin est déjà connecté
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAuthenticated(true);
      // Ne pas appeler fetchOrders ici, le faire dans un autre useEffect
    }
  }, []);

  // Effet séparé pour charger les données quand le token est disponible
  useEffect(() => {
    if (adminToken && isAuthenticated) {
      fetchProducts();
      fetchOrders();
      loadSiteSettings();
    }
  }, [adminToken, isAuthenticated, fetchOrders]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok && data.user.role === 'admin') {
        setAdminToken(data.token);
        localStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
        // Les données seront chargées par l'useEffect
      } else {
        setLoginError('Accès refusé. Seuls les administrateurs peuvent accéder à cette page.');
      }
    } catch (error) {
      setLoginError('Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setAdminToken(null);
    setLoginForm({ email: '', password: '' });
  };

  const loadSiteSettings = () => {
    const savedSettings = localStorage.getItem('millie_site_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSiteSettings(prevSettings => ({
        ...prevSettings,
        ...parsedSettings
      }));
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('price', productForm.price);
      formData.append('description', productForm.description);
      formData.append('category', productForm.category);
      formData.append('stock', productForm.stock);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }
      formData.append('colors', JSON.stringify(productForm.colors));
      formData.append('sizes', JSON.stringify(productForm.sizes));

      const url = editingProduct 
        ? `${API_BASE_URL}/api/products/${editingProduct._id}`
        : `${API_BASE_URL}/api/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        body: formData
      });

      if (response.ok) {
        alert(editingProduct ? 'Produit modifié avec succès!' : 'Produit ajouté avec succès!');
        setProductForm({ name: '', price: '', description: '', category: '', stock: '', image: null, colors: [], sizes: [] });
        setEditingProduct(null);
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert('Erreur: ' + (errorData.message || 'Erreur lors de la sauvegarde'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        if (response.ok) {
          alert('Produit supprimé avec succès!');
          fetchProducts();
        } else {
          const errorData = await response.json();
          alert('Erreur: ' + (errorData.message || 'Erreur lors de la suppression'));
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
      image: null,
      colors: product.colors || [],
      sizes: product.sizes || []
    });
    setEditingProduct(product);
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const removeCategory = (categoryToRemove) => {
    setCategories(categories.filter(cat => cat !== categoryToRemove));
  };

  const addColor = () => {
    setProductForm({
      ...productForm,
      colors: [...productForm.colors, { name: '', hex: '#000000' }]
    });
  };

  const updateColor = (index, field, value) => {
    const newColors = [...productForm.colors];
    newColors[index][field] = value;
    setProductForm({ ...productForm, colors: newColors });
  };

  const removeColor = (index) => {
    const newColors = productForm.colors.filter((_, i) => i !== index);
    setProductForm({ ...productForm, colors: newColors });
  };

  const addSize = () => {
    setProductForm({
      ...productForm,
      sizes: [...productForm.sizes, { size: '', stock: 0 }]
    });
  };

  const updateSize = (index, field, value) => {
    const newSizes = [...productForm.sizes];
    newSizes[index][field] = value;
    setProductForm({ ...productForm, sizes: newSizes });
  };

  const removeSize = (index) => {
    const newSizes = productForm.sizes.filter((_, i) => i !== index);
    setProductForm({ ...productForm, sizes: newSizes });
  };

  const saveSiteSettings = () => {
    localStorage.setItem('millie_site_settings', JSON.stringify(siteSettings));
    alert('Paramètres du site sauvegardés!');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('Statut de la commande mis à jour!');
        fetchOrders(); // Refresh orders list
      } else {
        alert('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const updateHomeCategoryImage = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newCategories = [...siteSettings.homeCategories];
        newCategories[index].image = e.target.result;
        setSiteSettings({ ...siteSettings, homeCategories: newCategories });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAboutImage = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSiteSettings({ ...siteSettings, aboutImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAboutFeature = (index, field, value) => {
    const newFeatures = [...siteSettings.aboutFeatures];
    newFeatures[index][field] = value;
    setSiteSettings({ ...siteSettings, aboutFeatures: newFeatures });
  };

  // Page de connexion admin
  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-container">
          <div className="admin-login-card">
            <h1>🛠️ Administration Millie Shop</h1>
            <p>Accès réservé aux administrateurs</p>
            
            {loginError && <div className="error-message">{loginError}</div>}
            
            <form onSubmit={handleAdminLogin}>
              <input
                type="email"
                placeholder="Email administrateur"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
            
            <div className="admin-credentials">
              <h4>Identifiants par défaut :</h4>
              <p><strong>Email:</strong> admin@millie-shop.com</p>
              <p><strong>Mot de passe:</strong> admin123</p>
            </div>
            
            <div className="back-to-site">
              <a href="/">← Retour au site</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛠️ Panneau d'Administration - Millie Shop</h1>
        <p>Gérez tous les aspects de votre site</p>
        <div className="admin-info">
          <p><strong>Administrateur connecté</strong></p>
          <button onClick={handleLogout} className="btn-logout">
            🚪 Se déconnecter
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          📦 Produits
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          📋 Commandes
        </button>
        <button 
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          🏷️ Catégories
        </button>
        <button 
          className={activeTab === 'homepage' ? 'active' : ''}
          onClick={() => setActiveTab('homepage')}
        >
          🏠 Page d'Accueil
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Paramètres
        </button>
      </div>

      <div className="admin-content">
        {/* GESTION DES PRODUITS */}
        {activeTab === 'products' && (
          <div className="products-management">
            <div className="admin-grid">
              <div className="form-section">
                <h2>{editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}</h2>
                <form onSubmit={handleProductSubmit} className="product-form">
                  <input
                    type="text"
                    placeholder="Nom du produit"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                  
                  <input
                    type="number"
                    placeholder="Prix (TND)"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                  
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    placeholder="Stock"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                  
                  <textarea
                    placeholder="Description du produit"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows="4"
                    required
                  />
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })}
                  />

                  {/* Gestion des couleurs */}
                  <div className="colors-section">
                    <h4>Couleurs disponibles</h4>
                    {productForm.colors.map((color, index) => (
                      <div key={index} className="color-input">
                        <input
                          type="text"
                          placeholder="Nom de la couleur"
                          value={color.name}
                          onChange={(e) => updateColor(index, 'name', e.target.value)}
                        />
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => updateColor(index, 'hex', e.target.value)}
                        />
                        <button type="button" onClick={() => removeColor(index)}>❌</button>
                      </div>
                    ))}
                    <button type="button" onClick={addColor} className="btn-add-color">
                      + Ajouter une couleur
                    </button>
                  </div>

                  {/* Gestion des tailles */}
                  <div className="sizes-section">
                    <h4>Tailles et Stock</h4>
                    {productForm.sizes.map((size, index) => (
                      <div key={index} className="size-input">
                        <select
                          value={size.size}
                          onChange={(e) => updateSize(index, 'size', e.target.value)}
                          required
                        >
                          <option value="">Sélectionner taille</option>
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                          <option value="34">34</option>
                          <option value="36">36</option>
                          <option value="38">38</option>
                          <option value="40">40</option>
                          <option value="42">42</option>
                          <option value="44">44</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Stock"
                          value={size.stock}
                          onChange={(e) => updateSize(index, 'stock', parseInt(e.target.value) || 0)}
                          min="0"
                          required
                        />
                        <button type="button" onClick={() => removeSize(index)}>❌</button>
                      </div>
                    ))}
                    <button type="button" onClick={addSize} className="btn-add-size">
                      + Ajouter une taille
                    </button>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-primary">
                      {loading ? 'Sauvegarde...' : (editingProduct ? 'Modifier' : 'Ajouter')}
                    </button>
                    {editingProduct && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingProduct(null);
                          setProductForm({ name: '', price: '', description: '', category: '', stock: '', image: null, colors: [], sizes: [] });
                        }}
                        className="btn-secondary"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="products-list">
                <h2>Liste des Produits ({products.length})</h2>
                <div className="products-grid-admin">
                  {products.map(product => (
                    <div key={product._id} className="product-card-admin">
                      <img 
                        src={`${API_BASE_URL}${product.image}`} 
                        alt={product.name}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                      />
                      <div className="product-info-admin">
                        <h4>{product.name}</h4>
                        <p className="price">{product.price} TND</p>
                        <p className="category">{product.category}</p>
                        <p className="stock">Stock total: {product.stock}</p>
                        {product.colors && product.colors.length > 0 && (
                          <div className="colors-display">
                            {product.colors.map((color, index) => (
                              <span 
                                key={index}
                                className="color-dot"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              ></span>
                            ))}
                          </div>
                        )}
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="sizes-display">
                            <strong>Tailles:</strong>
                            {product.sizes.map((size, index) => (
                              <span key={index} className="size-badge">
                                {size.size} ({size.stock})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="product-actions">
                        <button onClick={() => handleEditProduct(product)} className="btn-edit">
                          ✏️ Modifier
                        </button>
                        <button onClick={() => handleDeleteProduct(product._id)} className="btn-delete">
                          🗑️ Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GESTION DES COMMANDES */}
        {activeTab === 'orders' && (
          <div className="orders-management">
            <div className="orders-header">
              <h2>Gestion des Commandes ({orders.length})</h2>
              <button 
                onClick={fetchOrders} 
                className="btn-refresh"
                disabled={loading}
              >
                🔄 Actualiser
              </button>
            </div>
            
            {orders.length === 0 ? (
              <div className="no-orders">
                <p>Aucune commande pour le moment</p>
                <p><small>Les commandes apparaîtront ici une fois créées par les clients</small></p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h3>Commande #{order._id.slice(-6)}</h3>
                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="order-status">
                        <select 
                          value={order.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="preparing">En préparation</option>
                          <option value="shipped">Expédiée</option>
                          <option value="delivered">Livrée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="order-customer">
                      <h4>Informations Client</h4>
                      <p><strong>Nom:</strong> {order.customerInfo?.name}</p>
                      <p><strong>Email:</strong> {order.customerInfo?.email}</p>
                      <p><strong>Téléphone:</strong> {order.customerInfo?.phone}</p>
                      <p><strong>Adresse:</strong> {order.customerInfo?.address}</p>
                    </div>
                    
                    <div className="order-items">
                      <h4>Produits Commandés</h4>
                      {order.items?.map((item, index) => (
                        <div key={index} className="order-item">
                          <span>{item.name}</span>
                          <span>x{item.quantity}</span>
                          <span>{item.price} TND</span>
                          <span className="item-total">{(item.price * item.quantity).toFixed(2)} TND</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-total">
                      <strong>Total: {order.total?.toFixed(2)} TND</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GESTION DES CATÉGORIES */}
        {activeTab === 'categories' && (
          <div className="categories-management">
            <h2>Gestion des Catégories</h2>
            
            <div className="add-category">
              <input
                type="text"
                placeholder="Nouvelle catégorie"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button onClick={addCategory} className="btn-primary">Ajouter</button>
            </div>

            <div className="categories-list">
              {categories.map((category, index) => (
                <div key={index} className="category-item">
                  <span>{category}</span>
                  <button onClick={() => removeCategory(category)} className="btn-delete">
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GESTION DE LA PAGE D'ACCUEIL */}
        {activeTab === 'homepage' && (
          <div className="homepage-management">
            <h2>Gestion de la Page d'Accueil</h2>
            
            <div className="hero-section">
              <h3>Section Hero</h3>
              <input
                type="text"
                placeholder="Titre principal"
                value={siteSettings.heroTitle}
                onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
              />
              <input
                type="text"
                placeholder="Sous-titre"
                value={siteSettings.heroSubtitle}
                onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
              />
            </div>

            <div className="home-categories-section">
              <h3>Catégories de l'Accueil</h3>
              {siteSettings.homeCategories.map((category, index) => (
                <div key={index} className="home-category-edit">
                  <input
                    type="text"
                    placeholder="Nom de la catégorie"
                    value={category.name}
                    onChange={(e) => {
                      const newCategories = [...siteSettings.homeCategories];
                      newCategories[index].name = e.target.value;
                      setSiteSettings({ ...siteSettings, homeCategories: newCategories });
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={category.description}
                    onChange={(e) => {
                      const newCategories = [...siteSettings.homeCategories];
                      newCategories[index].description = e.target.value;
                      setSiteSettings({ ...siteSettings, homeCategories: newCategories });
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateHomeCategoryImage(index, e.target.files[0])}
                  />
                  {category.image && (
                    <img src={category.image} alt="Preview" className="image-preview" />
                  )}
                </div>
              ))}
            </div>

            <div className="about-section-edit">
              <h3>Section À Propos</h3>
              
              <div className="form-group">
                <label>Titre de la section</label>
                <input
                  type="text"
                  placeholder="À Propos de Nous"
                  value={siteSettings.aboutTitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, aboutTitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description principale</label>
                <textarea
                  rows="4"
                  placeholder="Description de votre entreprise..."
                  value={siteSettings.aboutDescription}
                  onChange={(e) => setSiteSettings({ ...siteSettings, aboutDescription: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Image À Propos</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateAboutImage(e.target.files[0])}
                />
                {siteSettings.aboutImage && (
                  <img src={siteSettings.aboutImage} alt="Preview À Propos" className="image-preview-large" />
                )}
              </div>

              <div className="features-edit">
                <h4>Caractéristiques (3 points forts)</h4>
                {siteSettings.aboutFeatures.map((feature, index) => (
                  <div key={index} className="feature-edit">
                    <input
                      type="text"
                      placeholder="Icône (emoji)"
                      value={feature.icon}
                      onChange={(e) => updateAboutFeature(index, 'icon', e.target.value)}
                      style={{ width: '60px' }}
                    />
                    <input
                      type="text"
                      placeholder="Titre"
                      value={feature.title}
                      onChange={(e) => updateAboutFeature(index, 'title', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={feature.description}
                      onChange={(e) => updateAboutFeature(index, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={saveSiteSettings} className="btn-primary">
              Sauvegarder les Modifications
            </button>
          </div>
        )}

        {/* PARAMÈTRES GÉNÉRAUX */}
        {activeTab === 'settings' && (
          <div className="settings-management">
            <h2>Paramètres Généraux</h2>
            
            <div className="setting-group">
              <label>Nom du Site</label>
              <input
                type="text"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
              />
            </div>

            <div className="setting-group">
              <label>Texte À Propos</label>
              <textarea
                rows="6"
                value={siteSettings.aboutText}
                onChange={(e) => setSiteSettings({ ...siteSettings, aboutText: e.target.value })}
                placeholder="Texte de présentation de l'entreprise..."
              />
            </div>

            <button onClick={saveSiteSettings} className="btn-primary">
              Sauvegarder les Paramètres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}