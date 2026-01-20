import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  // Sample products data (same as Shop)
  const sampleProducts = [
    {
      id: 1,
      name: 'Robe Élégante Noire',
      price: 89.99,
      description: 'Robe élégante parfaite pour toutes les occasions spéciales. Coupe flatteuse et tissu de qualité premium.',
      category: 'Robes',
      image: 'https://images.unsplash.com/photo-1566479179817-c0ae8e5b4b8e?w=600',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      details: 'Matière: 95% Polyester, 5% Élasthanne. Lavage en machine à 30°C.'
    },
    {
      id: 2,
      name: 'Set Coordonné Chic',
      price: 129.99,
      description: 'Set deux pièces tendance et confortable. Parfait pour un look décontracté-chic.',
      category: 'Set',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      details: 'Matière: 100% Coton. Lavage en machine à 40°C.'
    },
    {
      id: 3,
      name: 'Robe Florale Nouvelle Collection',
      price: 99.99,
      description: 'Découvrez notre nouvelle collection avec cette magnifique robe à motifs floraux.',
      category: 'Nouvelle Collection',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      details: 'Matière: 90% Viscose, 10% Élasthanne. Lavage à la main recommandé.'
    },
    {
      id: 4,
      name: 'Robe Cocktail Bordeaux',
      price: 119.99,
      description: 'Robe cocktail sophistiquée pour vos soirées spéciales.',
      category: 'Robes',
      image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      details: 'Matière: 100% Polyester. Nettoyage à sec recommandé.'
    },
    {
      id: 5,
      name: 'Set Blazer & Pantalon',
      price: 159.99,
      description: 'Set professionnel élégant pour le bureau.',
      category: 'Set',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      details: 'Matière: 70% Polyester, 30% Viscose. Nettoyage à sec.'
    },
    {
      id: 6,
      name: 'Robe Midi Nouvelle Collection',
      price: 109.99,
      description: 'Robe midi moderne de notre nouvelle collection.',
      category: 'Nouvelle Collection',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      details: 'Matière: 85% Coton, 15% Élasthanne. Lavage en machine à 30°C.'
    }
  ];

  useEffect(() => {
    const foundProduct = sampleProducts.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      navigate('/shop');
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product, selectedSize);
      }
      alert(`${quantity} x ${product.name} (Taille ${selectedSize}) ajouté au panier!`);
    }
  };

  if (!product) {
    return (
      <div className="product-detail">
        <div className="container">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/shop')}>
          ← Retour à la boutique
        </button>
        
        <div className="product-detail-content">
          <div className="product-image">
            <img src={product.image} alt={product.name} />
          </div>
          
          <div className="product-info">
            <h1>{product.name}</h1>
            <div className="product-price">{product.price.toFixed(2)} TND</div>
            <p className="product-description">{product.description}</p>
            
            <div className="product-options">
              <div className="size-selector">
                <label>Taille:</label>
                <div className="size-buttons">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="quantity-selector">
                <label>Quantité:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <button className="btn add-to-cart-btn" onClick={handleAddToCart}>
              Ajouter au Panier - {(product.price * quantity).toFixed(2)} TND
            </button>
            
            <div className="product-details">
              <h3>Détails du produit</h3>
              <p>{product.details}</p>
              <p><strong>Catégorie:</strong> {product.category}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;