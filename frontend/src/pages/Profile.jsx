import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    phone: user?.phone || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        alert('Profil mis à jour !');
        setEditMode(false);
        // Refresh user data
        window.location.reload();
      } else {
        const error = await response.json();
        alert('Erreur: ' + error.message);
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        alert('Mot de passe modifié !');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        alert('Erreur: ' + error.message);
      }
    } catch (error) {
      alert('Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Commande annulée');
        fetchOrders();
      } else {
        const error = await response.json();
        alert('Erreur: ' + error.message);
      }
    } catch (error) {
      alert('Erreur lors de l\'annulation');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      paid: '#3498db',
      processing: '#9b59b6',
      shipped: '#e67e22',
      delivered: '#27ae60',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'En attente',
      paid: 'Payée',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="not-logged-in">
          <h2>Vous devez être connecté pour accéder à cette page</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h1>Bonjour, {user.name} !</h1>
            <p className="user-email">{user.email}</p>
            <span className={`user-role ${user.role}`}>
              {user.role === 'admin' ? '👑 Administrateur' : '👤 Client'}
            </span>
          </div>
        </div>
        <button onClick={logout} className="btn-logout">
          🚪 Déconnexion
        </button>
      </div>

      <div className="profile-tabs">
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          👤 Mon Profil
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Mes Commandes
        </button>
        <button
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => setActiveTab('security')}
        >
          🔒 Sécurité
        </button>
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h2>Informations personnelles</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className={editMode ? 'btn-secondary' : 'btn-primary'}
              >
                {editMode ? '❌ Annuler' : '✏️ Modifier'}
              </button>
            </div>

            <form onSubmit={updateProfile} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom complet</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    disabled={!editMode}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    disabled={!editMode}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    disabled={!editMode}
                    placeholder="Votre numéro de téléphone"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Adresse</label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    disabled={!editMode}
                    placeholder="Votre adresse complète"
                    rows="3"
                  />
                </div>
              </div>

              {editMode && (
                <div className="form-actions">
                  <button type="submit" disabled={loading} className="btn-success">
                    {loading ? 'Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="orders-content">
          <div className="section-header">
            <h2>Mes commandes ({orders.length})</h2>
          </div>

          {loading ? (
            <div className="loading">Chargement des commandes...</div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <h3>😔 Aucune commande</h3>
              <p>Vous n'avez pas encore passé de commande.</p>
              <a href="/shop" className="btn-primary">
                🛍️ Découvrir nos produits
              </a>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Commande #{order._id.slice(-8)}</h3>
                      <p className="order-date">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="order-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <img 
                          src={`http://localhost:5000${item.image}`}
                          alt={item.name}
                          onError={(e) => e.target.src = 'https://via.placeholder.com/60x60?text=No+Image'}
                        />
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p>Quantité: {item.quantity}</p>
                          <p className="item-price">{item.price} TND / unité</p>
                        </div>
                        <div className="item-total">
                          {(item.price * item.quantity).toFixed(2)} TND
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <strong>Total: {order.total?.toFixed(2)} TND</strong>
                    </div>
                    <div className="order-actions">
                      {['pending', 'paid'].includes(order.status) && (
                        <button 
                          onClick={() => cancelOrder(order._id)}
                          className="btn-danger"
                        >
                          ❌ Annuler
                        </button>
                      )}
                      {order.trackingNumber && (
                        <div className="tracking-info">
                          <strong>Suivi: {order.trackingNumber}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="security-content">
          <div className="profile-section">
            <div className="section-header">
              <h2>Changer le mot de passe</h2>
            </div>

            <form onSubmit={changePassword} className="password-form">
              <div className="form-group">
                <label>Mot de passe actuel</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  minLength="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  minLength="6"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Modification...' : '🔒 Changer le mot de passe'}
                </button>
              </div>
            </form>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2>Informations du compte</h2>
            </div>
            
            <div className="account-info">
              <div className="info-item">
                <span className="info-label">Membre depuis:</span>
                <span className="info-value">{formatDate(user.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Type de compte:</span>
                <span className="info-value">{user.role === 'admin' ? 'Administrateur' : 'Client'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Commandes passées:</span>
                <span className="info-value">{orders.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}