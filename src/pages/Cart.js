import { useCart } from '../context/CartContext';
import './Cart.css';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Votre panier est vide!');
      return;
    }
    
    alert(`Commande confirmée! Total: ${getCartTotal().toFixed(2)} TND\n\nMerci pour votre achat!`);
    clearCart();
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart">
        <div className="container">
          <h1>Panier</h1>
          <div className="empty-cart">
            <p>Votre panier est vide</p>
            <a href="/shop" className="btn">Continuer vos achats</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <h1>Panier ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${item.size}-${index}`} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>Taille: {item.size}</p>
                  <div className="item-price">{item.price.toFixed(2)} TND</div>
                </div>
                
                <div className="item-controls">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="item-total">
                    {(item.price * item.quantity).toFixed(2)} TND
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="remove-btn"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Résumé de la commande</h3>
            <div className="summary-line">
              <span>Sous-total:</span>
              <span>{getCartTotal().toFixed(2)} TND</span>
            </div>
            <div className="summary-line">
              <span>Livraison:</span>
              <span>Gratuite</span>
            </div>
            <div className="summary-line total">
              <span>Total:</span>
              <span>{getCartTotal().toFixed(2)} TND</span>
            </div>
            
            <button className="btn checkout-btn" onClick={handleCheckout}>
              Passer la commande
            </button>
            
            <button className="btn-outline clear-btn" onClick={clearCart}>
              Vider le panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;