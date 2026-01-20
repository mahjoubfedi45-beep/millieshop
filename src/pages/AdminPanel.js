import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import './AdminPanel.css';

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Robes',
    image: '',
    description: ''
  });

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      alert('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.email === 'admin@millie-shop.com' && loginForm.password === 'admin123') {
      setIsLoggedIn(true);
    } else {
      alert('Email ou mot de passe incorrect');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image: newProduct.image,
          description: newProduct.description,
          sizes: [
            { size: 'XS', stock: 5 },
            { size: 'S', stock: 5 },
            { size: 'M', stock: 5 },
            { size: 'L', stock: 5 },
            { size: 'XL', stock: 5 }
          ]
        })
      });

      if (response.ok) {
        setNewProduct({
          name: '',
          price: '',
          category: 'Robes',
          image: '',
          description: ''
        });
        alert('Produit ajouté avec succès!');
        fetchProducts(); // Refresh products list
      } else {
        throw new Error('Erreur lors de l\'ajout du produit');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Erreur lors de l\'ajout du produit');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Produit supprimé avec succès!');
        fetchProducts(); // Refresh products list
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Erreur lors de la suppression du produit');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-panel">
        <div className="container">
          <div className="login-form">
            <h1>Connexion Admin</h1>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  placeholder="admin@millie-shop.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe:</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="admin123"
                  required
                />
              </div>
              <button type="submit" className="btn">Se connecter</button>
            </form>
            <div className="login-info">
              <p><strong>Identifiants de test:</strong></p>
              <p>Email: admin@millie-shop.com</p>
              <p>Mot de passe: admin123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="container">
        <div className="admin-header">
          <h1>Panel d'Administration</h1>
          <button 
            className="btn-outline logout-btn"
            onClick={() => setIsLoggedIn(false)}
          >
            Déconnexion
          </button>
        </div>

        <div className="admin-content">
          {/* Add Product Form */}
          <div className="admin-section">
            <h2>Ajouter un Produit</h2>
            <form onSubmit={handleAddProduct} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom du produit *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Prix (TND) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="Robes">Robes</option>
                    <option value="Set">Set</option>
                    <option value="Nouvelle Collection">Nouvelle Collection</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>URL de l'image *</label>
                  <input
                    type="url"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows="3"
                  placeholder="Description du produit..."
                />
              </div>
              
              <button type="submit" className="btn">Ajouter le Produit</button>
            </form>
          </div>

          {/* Products List */}
          <div className="admin-section">
            <h2>Produits ({products.length})</h2>
            {loading ? (
              <div className="loading">Chargement des produits...</div>
            ) : (
              <div className="products-list">
                {products.map(product => (
                  <div key={product.id} className="product-item">
                    <img src={product.image} alt={product.name} />
                    <div className="product-details">
                      <h3>{product.name}</h3>
                      <p className="product-category">{product.category}</p>
                      <p className="product-price">{product.price.toFixed(2)} TND</p>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;