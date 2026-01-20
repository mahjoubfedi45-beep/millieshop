import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import './Favorites.css';

export default function Favorites() {
  const { favorites, removeFromFavorites, loading } = useFavorites();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="favorites-empty">
        <h2>🔒 Connexion requise</h2>
        <p>Vous devez être connecté pour voir vos favoris</p>
        <button onClick={() => navigate('/auth')} className="btn-login">
          Se connecter
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <h2>⏳ Chargement...</h2>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <h2>💔 Aucun favori</h2>
        <p>Vous n'avez pas encore ajouté de produits à vos favoris</p>
        <button onClick={() => navigate('/shop')} className="btn-shop">
          Découvrir la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>❤️ Mes Favoris</h1>
        <p>{favorites.length} produit{favorites.length > 1 ? 's' : ''}</p>
      </div>

      <div className="favorites-grid">
        {favorites.map(favorite => {
          const product = favorite.product;
          if (!product) return null;

          return (
            <div key={favorite._id} className="favorite-card">
              <button 
                className="btn-remove-favorite"
                onClick={() => removeFromFavorites(product._id)}
                title="Retirer des favoris"
              >
                ❌
              </button>

              <div 
                className="favorite-image"
                onClick={() => navigate(`/product/${product._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img 
                  src={`${API_BASE_URL}${product.image}`} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
                {product.stock === 0 && (
                  <div className="out-of-stock-badge">Rupture de stock</div>
                )}
              </div>

              <div className="favorite-info">
                <span className="product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="favorite-footer">
                  <p className="product-price">{product.price} TND</p>
                  <button 
                    className="btn-add-to-cart"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? '❌ Indisponible' : '🛒 Ajouter au panier'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}