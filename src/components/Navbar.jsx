import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { getCartCount } = useCart();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Millie Shop
        </Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            Accueil
          </Link>
          <Link to="/shop" className="navbar-link">
            Boutique
          </Link>
          
          <Link to="/cart" className="navbar-link">
            🛒 Panier <span className="cart-badge">{getCartCount()}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}