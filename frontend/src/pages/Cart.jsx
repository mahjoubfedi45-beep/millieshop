import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.phone || !shippingInfo.email) {
      alert('Veuillez remplir toutes les informations de livraison');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cart,
          customerInfo: {
            name: shippingInfo.name,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: shippingInfo.address
          },
          paymentMethod: 'card'
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Commande créée avec succès ! Numéro de commande: #${data.order.orderNumber}`);
        clearCart();
        navigate('/');
      } else {
        alert(`❌ Erreur: ${data.message}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>🛒 Votre panier est vide</h2>
        <p>Découvrez nos produits !</p>
        <button onClick={() => navigate('/shop')} className="btn-shop">
          Voir la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Mon Panier</h1>

      <div className="cart-content">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <img 
                src={`${API_BASE_URL}${item.image}`} 
                alt={item.name}
                onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
              />
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-price">{item.price} TND</p>
              </div>
              <div className="item-controls">
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                  +
                </button>
              </div>
              <div className="item-total">
                {(item.price * item.quantity).toFixed(2)} TND
              </div>
              <button 
                className="btn-remove"
                onClick={() => removeFromCart(item._id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Récapitulatif</h2>
          
          <div className="summary-line">
            <span>Sous-total:</span>
            <span>{getCartTotal().toFixed(2)} TND</span>
          </div>
          <div className="summary-line">
            <span>Livraison:</span>
            <span>Gratuite</span>
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>{getCartTotal().toFixed(2)} TND</span>
          </div>

          <div className="shipping-form">
            <h3>Informations de livraison</h3>
            <input
              type="text"
              placeholder="Nom complet"
              value={shippingInfo.name}
              onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={shippingInfo.email}
              onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Téléphone"
              value={shippingInfo.phone}
              onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
              required
            />
            <textarea
              placeholder="Adresse complète"
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
              rows="3"
              required
            />
          </div>

          <button 
            className="btn-checkout"
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? 'Traitement...' : 'Valider la commande'}
          </button>
        </div>
      </div>
    </div>
  );
}