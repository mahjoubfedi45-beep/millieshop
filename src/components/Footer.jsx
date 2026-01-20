import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">Millie Shop</h3>
            <p className="footer-description">
              Découvrez l'élégance à chaque tenue avec Millie Shop. Notre collection exclusive 
              de mode féminine allie sophistication, qualité et style contemporain. 
              Depuis notre création, nous nous engageons à offrir des créations uniques 
              qui reflètent votre personnalité et subliment votre féminité.
            </p>
            <div className="social-links">
              <button className="social-link" aria-label="Facebook">
                📘
              </button>
              <button className="social-link" aria-label="Instagram">
                📷
              </button>
              <button className="social-link" aria-label="Twitter">
                🐦
              </button>
              <button className="social-link" aria-label="YouTube">
                📺
              </button>
            </div>
          </div>

          <div className="footer-section">
            <h4>Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/shop">Boutique</Link></li>
              <li><Link to="/cart">Panier</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Catégories</h4>
            <ul className="footer-links">
              <li><a href="/shop?category=robes">Robes</a></li>
              <li><a href="/shop?category=set">Set</a></li>
              <li><a href="/shop?category=nouvelle-collection">Nouvelle Collection</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Service Client</h4>
            <ul className="footer-links">
              <li><a href="#contact">Nous Contacter</a></li>
              <li><a href="#faq">Questions Fréquentes</a></li>
              <li><a href="#shipping">Livraison & Retours</a></li>
              <li><a href="#size-guide">Guide des Tailles</a></li>
              <li><a href="#care">Entretien des Vêtements</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Informations</h4>
            <ul className="footer-links">
              <li><a href="#about">Notre Histoire</a></li>
              <li><a href="#quality">Qualité & Artisanat</a></li>
              <li><a href="#privacy">Politique de Confidentialité</a></li>
              <li><a href="#terms">Conditions Générales</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Restez Connecté</h4>
            <p className="newsletter-text">
              Inscrivez-vous à notre newsletter pour recevoir en exclusivité nos dernières 
              collections, offres spéciales et conseils mode directement dans votre boîte mail.
            </p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Votre email"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">
                S'abonner
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Millie Shop. Tous droits réservés.
            </p>
            <div className="payment-methods">
              <span className="payment-text">Paiements acceptés:</span>
              <div className="payment-icons">
                <span className="payment-icon">💳</span>
                <span className="payment-icon">🅿️</span>
                <span className="payment-icon">🏦</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}