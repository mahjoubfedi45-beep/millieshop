import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

function Navbar() {
  const { getCartItemsCount } = useCart();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Millie Shop</h1>
        </Link>
        
        <div className="nav-links">
          <Link to="/">Accueil</Link>
          <Link to="/shop">Boutique</Link>
          <Link to="/cart" className="cart-link">
            Panier ({getCartItemsCount()})
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;