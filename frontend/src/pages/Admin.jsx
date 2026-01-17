import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

export default function Admin() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentOrders: [],
    topProducts: [],
    lowStockProducts: []
  });
  
  // Products data
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '', price: '', description: '', category: '', stock: '', image: null
  });
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Orders data
  const [orders, setOrders] = useState([]);
  const [orderFilters, setOrderFilters] = useState({ status: 'all', search: '' });
  
  // Users data
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({ role: 'all', search: '' });
  
  // Settings
  const [settings, setSettings] = useState({
    siteName: 'Mode Shop',
    currency: 'EUR',
    taxRate: 0.20,
    shippingCost: 0,
    freeShippingThreshold: 50,
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true
  });

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboard();
    else if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'settings') fetchSettings();
  }, [activeTab]);

  // Dashboard functions
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Erreur dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Product functions
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Erreur produits:', error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(productForm).forEach(key => {
      if (productForm[key] !== null && productForm[key] !== '') {
        formData.append(key, productForm[key]);
      }
    });

    try {
      const url = editingProduct 
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : 'http://localhost:5000/api/products';
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        alert(editingProduct ? 'Produit modifié !' : 'Produit créé !');
        resetProductForm();
        fetchProducts();
      } else {
        const error = await response.json();
        alert('Erreur: ' + error.message);
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({ name: '', price: '', description: '', category: '', stock: '', image: null });
    setEditingProduct(null);
  };

  const handleBulkDelete = async () => {
    if (!selectedProducts.length) return;
    if (!window.confirm(`Supprimer ${selectedProducts.length} produits ?`)) return;

    try {
      const response = await fetch('http://localhost:5000/api/admin/products/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productIds: selectedProducts })
      });

      if (response.ok) {
        alert('Produits supprimés !');
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  // Order functions
  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (orderFilters.status !== 'all') params.append('status', orderFilters.status);
      if (orderFilters.search) params.append('search', orderFilters.search);

      const response = await fetch(`http://localhost:5000/api/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Erreur commandes:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  // User functions
  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userFilters.role !== 'all') params.append('role', userFilters.role);
      if (userFilters.search) params.append('search', userFilters.search);

      const response = await fetch(`http://localhost:5000/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Erreur utilisateurs:', error);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  // Settings functions
  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Erreur paramètres:', error);
    }
  };

  const updateSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Paramètres mis à jour !');
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const exportOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/export/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Create CSV and download
      const csv = [
        Object.keys(data.data[0]).join(','),
        ...data.data.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      alert('Erreur lors de l\'export');
    }
  };

  const formatCurrency = (amount) => `${amount?.toFixed(2)} TND`;
  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🛠️ Administration</h1>
        <div className="admin-actions">
          <button onClick={exportOrders} className="btn-export">
            📊 Exporter les données
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        {[
          { id: 'dashboard', label: '📊 Tableau de bord', icon: '📊' },
          { id: 'products', label: '📦 Produits', icon: '📦' },
          { id: 'orders', label: '🛒 Commandes', icon: '🛒' },
          { id: 'users', label: '👥 Utilisateurs', icon: '👥' },
          { id: 'settings', label: '⚙️ Paramètres', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="loading-overlay">Chargement...</div>}

      {/* DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Revenus Total</h3>
                <div className="stat-value">{formatCurrency(dashboardData.stats.totalRevenue)}</div>
              </div>
            </div>
            <div className="stat-card orders">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <h3>Commandes</h3>
                <div className="stat-value">{dashboardData.stats.totalOrders || 0}</div>
              </div>
            </div>
            <div className="stat-card products">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>Produits</h3>
                <div className="stat-value">{dashboardData.stats.totalProducts || 0}</div>
              </div>
            </div>
            <div className="stat-card users">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Utilisateurs</h3>
                <div className="stat-value">{dashboardData.stats.totalUsers || 0}</div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-section">
              <h3>📈 Commandes récentes</h3>
              <div className="recent-orders">
                {dashboardData.recentOrders?.map(order => (
                  <div key={order._id} className="recent-order">
                    <div className="order-info">
                      <strong>#{order._id.slice(-6)}</strong>
                      <span>{order.user?.name}</span>
                    </div>
                    <div className="order-meta">
                      <span className={`status-badge ${order.status}`}>{order.status}</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section">
              <h3>🔥 Produits populaires</h3>
              <div className="top-products">
                {dashboardData.topProducts?.map(item => (
                  <div key={item._id} className="top-product">
                    <div className="product-info">
                      <strong>{item.product?.name}</strong>
                      <span>{item.totalSold} vendus</span>
                    </div>
                    <div className="product-revenue">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section">
              <h3>⚠️ Stock faible</h3>
              <div className="low-stock">
                {dashboardData.lowStockProducts?.map(product => (
                  <div key={product._id} className="low-stock-item">
                    <span>{product.name}</span>
                    <span className="stock-count">{product.stock} restants</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      {activeTab === 'products' && (
        <div className="products-content">
          <div className="section-header">
            <h2>📦 Gestion des produits</h2>
            <div className="bulk-actions">
              {selectedProducts.length > 0 && (
                <button onClick={handleBulkDelete} className="btn-danger">
                  🗑️ Supprimer ({selectedProducts.length})
                </button>
              )}
            </div>
          </div>

          <div className="admin-grid">
            <div className="admin-form-section">
              <h3>{editingProduct ? 'Modifier' : 'Ajouter'} un produit</h3>
              <form onSubmit={handleProductSubmit} className="product-form">
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Nom du produit"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Prix (TND)"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Catégorie"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    required
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  rows="3"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductForm({...productForm, image: e.target.files[0]})}
                />
                <div className="form-actions">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Sauvegarde...' : (editingProduct ? 'Modifier' : 'Ajouter')}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={resetProductForm} className="btn-secondary">
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-list-section">
              <div className="products-table">
                <div className="table-header">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(products.map(p => p._id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                  />
                  <span>Image</span>
                  <span>Nom</span>
                  <span>Prix</span>
                  <span>Stock</span>
                  <span>Actions</span>
                </div>
                {products.map(product => (
                  <div key={product._id} className="table-row">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product._id]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                        }
                      }}
                    />
                    <img 
                      src={`http://localhost:5000${product.image}`} 
                      alt={product.name}
                      className="product-thumb"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/50x50?text=No+Image'}
                    />
                    <span className="product-name">{product.name}</span>
                    <span className="product-price">{formatCurrency(product.price)}</span>
                    <span className={`product-stock ${product.stock <= 10 ? 'low' : ''}`}>
                      {product.stock}
                    </span>
                    <div className="table-actions">
                      <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setProductForm({
                            name: product.name,
                            price: product.price,
                            description: product.description,
                            category: product.category,
                            stock: product.stock,
                            image: null
                          });
                        }}
                        className="btn-edit"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Supprimer ce produit ?')) {
                            try {
                              await fetch(`http://localhost:5000/api/products/${product._id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              fetchProducts();
                            } catch (error) {
                              alert('Erreur lors de la suppression');
                            }
                          }
                        }}
                        className="btn-delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS */}
      {activeTab === 'orders' && (
        <div className="orders-content">
          <div className="section-header">
            <h2>🛒 Gestion des commandes</h2>
            <div className="filters">
              <select
                value={orderFilters.status}
                onChange={(e) => setOrderFilters({...orderFilters, status: e.target.value})}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="paid">Payée</option>
                <option value="processing">En traitement</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
              <input
                type="text"
                placeholder="Rechercher..."
                value={orderFilters.search}
                onChange={(e) => setOrderFilters({...orderFilters, search: e.target.value})}
              />
              <button onClick={fetchOrders} className="btn-primary">Filtrer</button>
            </div>
          </div>

          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-id">#{order._id.slice(-8)}</div>
                  <div className="order-date">{formatDate(order.createdAt)}</div>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className={`status-select ${order.status}`}
                  >
                    <option value="pending">En attente</option>
                    <option value="paid">Payée</option>
                    <option value="processing">En traitement</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
                
                <div className="order-details">
                  <div className="customer-info">
                    <strong>Client:</strong> {order.user?.name} ({order.user?.email})
                  </div>
                  <div className="order-items">
                    <strong>Articles:</strong>
                    {order.items?.map((item, index) => (
                      <span key={index}>
                        {item.name} x{item.quantity}
                        {index < order.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                  <div className="order-total">
                    <strong>Total: {formatCurrency(order.total)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="users-content">
          <div className="section-header">
            <h2>👥 Gestion des utilisateurs</h2>
            <div className="filters">
              <select
                value={userFilters.role}
                onChange={(e) => setUserFilters({...userFilters, role: e.target.value})}
              >
                <option value="all">Tous les rôles</option>
                <option value="client">Clients</option>
                <option value="admin">Administrateurs</option>
              </select>
              <input
                type="text"
                placeholder="Rechercher..."
                value={userFilters.search}
                onChange={(e) => setUserFilters({...userFilters, search: e.target.value})}
              />
              <button onClick={fetchUsers} className="btn-primary">Filtrer</button>
            </div>
          </div>

          <div className="users-table">
            <div className="table-header">
              <span>Nom</span>
              <span>Email</span>
              <span>Rôle</span>
              <span>Inscription</span>
              <span>Actions</span>
            </div>
            {users.map(user => (
              <div key={user._id} className="table-row">
                <span>{user.name}</span>
                <span>{user.email}</span>
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user._id, e.target.value)}
                  className={`role-select ${user.role}`}
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
                <span>{formatDate(user.createdAt)}</span>
                <div className="table-actions">
                  <button 
                    onClick={async () => {
                      if (window.confirm('Supprimer cet utilisateur ?')) {
                        try {
                          await fetch(`http://localhost:5000/api/admin/users/${user._id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          fetchUsers();
                        } catch (error) {
                          alert('Erreur lors de la suppression');
                        }
                      }
                    }}
                    className="btn-delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === 'settings' && (
        <div className="settings-content">
          <h2>⚙️ Paramètres du site</h2>
          
          <div className="settings-grid">
            <div className="settings-section">
              <h3>Informations générales</h3>
              <div className="form-group">
                <label>Nom du site</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Devise</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                >
                  <option value="TND">Dinar Tunisien (TND)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                  <option value="GBP">Livre (£)</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h3>Commerce</h3>
              <div className="form-group">
                <label>Taux de TVA (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.taxRate * 100}
                  onChange={(e) => setSettings({...settings, taxRate: e.target.value / 100})}
                />
              </div>
              <div className="form-group">
                <label>Coût de livraison (TND)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.shippingCost}
                  onChange={(e) => setSettings({...settings, shippingCost: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Seuil livraison gratuite (TND)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({...settings, freeShippingThreshold: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div className="settings-section">
              <h3>Options</h3>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  />
                  Mode maintenance
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => setSettings({...settings, allowRegistration: e.target.checked})}
                  />
                  Autoriser les inscriptions
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  />
                  Notifications email
                </label>
              </div>
            </div>
          </div>

          <div className="settings-actions">
            <button onClick={updateSettings} className="btn-primary">
              💾 Sauvegarder les paramètres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}