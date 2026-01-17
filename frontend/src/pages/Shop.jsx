import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Shop.css';

export default function Shop() {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  // Filtres et recherche
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    // Mettre à jour la catégorie sélectionnée depuis l'URL
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search, selectedCategory, minPrice, maxPrice, sort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
      });
      
      if (search) params.append('search', search);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort !== 'newest') params.append('sort', sort);
      
      const response = await fetch(`http://localhost:5000/api/products?${params}`);
      const data = await response.json();
      
      setProducts(data.products);
      setCategories(data.categories);
      setTotalPages(data.pagination.totalPages);
      setTotalProducts(data.pagination.totalProducts);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category !== 'all') {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const toggleFavorite = (product) => {
    // Fonctionnalité désactivée - pas de système de favoris
    alert('Fonctionnalité non disponible');
  };

  if (loading && products.length === 0) {
    return <div className="loading-container"><h2>⏳ Chargement...</h2></div>;
  }

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>Boutique</h1>
        <p className="products-count">{totalProducts} produits disponibles</p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="🔍 Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Rechercher</button>
        </form>

        <div className="filters">
          <select 
            value={selectedCategory} 
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Prix min"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setCurrentPage(1);
            }}
          />

          <input
            type="number"
            placeholder="Prix max"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select 
            value={sort} 
            onChange={(e) => {
              setSort(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="newest">Plus récent</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="name_asc">Nom A-Z</option>
          </select>

          <button className="btn-reset" onClick={resetFilters}>
            ❌ Réinitialiser
          </button>
        </div>
      </div>

      {/* Grille de produits */}
      {products.length === 0 ? (
        <div className="no-products">
          <h2>😕 Aucun produit trouvé</h2>
          <p>Essayez de modifier vos filtres de recherche</p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(product => (
              <div className="product-card" key={product._id}>
                <button 
                  className="btn-favorite"
                  onClick={() => toggleFavorite(product)}
                  title="Fonctionnalité non disponible"
                >
                  🤍
                </button>

                <div className="product-image">
                  <Link to={`/product/${product._id}`}>
                    <img 
                      src={`http://localhost:5000${product.image}`} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />
                  </Link>
                  {product.stock === 0 && (
                    <div className="out-of-stock-badge">Rupture de stock</div>
                  )}
                </div>

                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <Link to={`/product/${product._id}`}>
                    <h3>{product.name}</h3>
                  </Link>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <p className="product-price">{product.price} TND</p>
                    <button 
                      className="btn-add-cart"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Indisponible' : 'Ajouter au panier'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Précédent
              </button>

              <div className="page-numbers">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  // Afficher seulement quelques pages autour de la page actuelle
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={currentPage === page ? 'active' : ''}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page}>...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}