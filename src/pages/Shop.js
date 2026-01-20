import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';
import './Shop.css';

function Shop() {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        
        if (data.products) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Erreur lors du chargement des produits');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const categories = ['all', 'Robes', 'Set', 'Nouvelle Collection'];

  if (loading) {
    return (
      <div className="shop">
        <div className="container">
          <h1>Boutique</h1>
          <div className="loading">Chargement des produits...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop">
        <div className="container">
          <h1>Boutique</h1>
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop">
      <div className="container">
        <h1>Boutique</h1>
        
        {/* Category Filter */}
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'Tous' : category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <Link to={`/product/${product.id}`} className="product-image">
                <img src={product.image} alt={product.name} />
              </Link>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">{product.price.toFixed(2)} TND</div>
                <button 
                  className="btn add-to-cart-btn"
                  onClick={() => addToCart(product)}
                >
                  Ajouter au Panier
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="no-products">
            <p>Aucun produit trouvé dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;