import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [images, setImages] = useState([]);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        
        // Create images array - main image + gallery images if they exist
        const productImages = [data.image];
        if (data.gallery && data.gallery.length > 0) {
          productImages.push(...data.gallery);
        }
        setImages(productImages);
      } else {
        navigate('/shop');
      }
    } catch (error) {
      console.error('Erreur:', error);
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Veuillez sélectionner une taille');
      return;
    }
    
    const selectedSizeObj = product.sizes?.find(s => s.size === selectedSize);
    if (selectedSizeObj && selectedSizeObj.stock < quantity) {
      alert(`Stock insuffisant pour la taille ${selectedSize}. Stock disponible: ${selectedSizeObj.stock}`);
      return;
    }
    
    const productToAdd = {
      ...product,
      selectedSize,
      selectedColor,
      quantity
    };
    
    addToCart(productToAdd);
    
    // Show success message or animation
    const button = document.querySelector('.btn-add-to-cart');
    button.textContent = '✅ Ajouté !';
    setTimeout(() => {
      button.textContent = 'Ajouter au panier';
    }, 2000);
  };

  const toggleFavorite = () => {
    alert('Fonctionnalité non disponible');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>⏳ Chargement du produit...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>😕 Produit non trouvé</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary">
          Retour à la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <button onClick={() => navigate('/shop')} className="breadcrumb-link">
          ← Retour à la boutique
        </button>
      </div>

      <div className="product-detail-content">
        <div className="product-images">
          <div className="main-image">
            <img 
              src={`${API_BASE_URL}${images[selectedImageIndex]}`} 
              alt={product.name}
              onClick={() => openImageModal(selectedImageIndex)}
              style={{ cursor: 'pointer' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
              }}
            />
            {product.stock === 0 && (
              <div className="out-of-stock-overlay">
                <span>Rupture de stock</span>
              </div>
            )}
            <div className="image-zoom-hint">🔍 Cliquez pour agrandir</div>
          </div>
          
          {/* Image Gallery Thumbnails */}
          {images.length > 1 && (
            <div className="image-gallery">
              <h4>Galerie d'images</h4>
              <div className="thumbnails">
                {images.map((image, index) => (
                  <div 
                    key={index}
                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={`${API_BASE_URL}${image}`} 
                      alt={`${product.name} - Image ${index + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="product-header">
            <span className="product-category">{product.category}</span>
            <button 
              className="btn-favorite-large"
              onClick={toggleFavorite}
              title="Fonctionnalité non disponible"
            >
              🤍
            </button>
          </div>

          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-price">
            <span className="current-price">{product.price} TND</span>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-stock">
            <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `✅ En stock (${product.stock} disponibles)` : '❌ Rupture de stock'}
            </span>
          </div>

          {/* Sélection des couleurs */}
          {product.colors && product.colors.length > 0 && (
            <div className="color-selection">
              <h4>Couleur :</h4>
              <div className="color-options">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    className={`color-option ${selectedColor === color.name ? 'selected' : ''}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                  >
                    {selectedColor === color.name && '✓'}
                  </button>
                ))}
              </div>
              {selectedColor && <p className="selected-color">Couleur sélectionnée: {selectedColor}</p>}
            </div>
          )}

          {/* Sélection des tailles */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="size-selection">
              <h4>Taille :</h4>
              <div className="size-options">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    className={`size-option ${selectedSize === size.size ? 'selected' : ''} ${size.stock === 0 ? 'out-of-stock' : ''}`}
                    onClick={() => size.stock > 0 && setSelectedSize(size.size)}
                    disabled={size.stock === 0}
                  >
                    {size.size}
                    <span className="size-stock">({size.stock})</span>
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="selected-size">
                  Taille sélectionnée: {selectedSize} 
                  ({product.sizes.find(s => s.size === selectedSize)?.stock} disponibles)
                </p>
              )}
            </div>
          )}

          <div className="product-actions">
            {product.stock > 0 && (
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantité :</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={product.stock}
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button 
              className="btn-add-to-cart"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Indisponible' : 'Ajouter au panier'}
            </button>
          </div>

          <div className="product-details">
            <h3>Détails du produit</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Catégorie :</span>
                <span className="detail-value">{product.category}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Prix :</span>
                <span className="detail-value">{product.price} TND</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Disponibilité :</span>
                <span className="detail-value">
                  {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeImageModal}>×</button>
            
            <div className="modal-image-container">
              {images.length > 1 && (
                <button className="modal-nav prev" onClick={prevImage}>‹</button>
              )}
              
              <img 
                src={`${API_BASE_URL}${images[selectedImageIndex]}`} 
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                className="modal-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x800?text=No+Image';
                }}
              />
              
              {images.length > 1 && (
                <button className="modal-nav next" onClick={nextImage}>›</button>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="modal-thumbnails">
                {images.map((image, index) => (
                  <div 
                    key={index}
                    className={`modal-thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={`${API_BASE_URL}${image}`} 
                      alt={`Thumbnail ${index + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            <div className="modal-info">
              <p>{selectedImageIndex + 1} / {images.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}