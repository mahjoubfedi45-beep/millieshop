import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Home.css';

export default function Home() {
  const [siteSettings, setSiteSettings] = useState({
    heroTitle: 'Millie Shop',
    heroSubtitle: 'Mode Féminine & Élégance',
    homeCategories: [
      {
        name: 'Robes',
        image: '',
        description: 'Robes élégantes pour toutes les occasions'
      },
      {
        name: 'Set',
        image: '',
        description: 'Sets coordonnés tendance et chic'
      },
      {
        name: 'Nouvelle Collection',
        image: '',
        description: 'Découvrez nos dernières créations'
      }
    ]
  });

  useEffect(() => {
    // Charger les paramètres du site depuis localStorage
    const savedSettings = localStorage.getItem('millie_site_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSiteSettings(prevSettings => ({
        ...prevSettings,
        ...parsedSettings
      }));
    }
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero">
        <h1>{siteSettings.heroTitle}</h1>
        <p>{siteSettings.heroSubtitle}</p>
        <Link to="/shop">
          <button>Découvrir la Collection</button>
        </Link>
      </div>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2>Nos Catégories</h2>
          <div className="categories-grid">
            {siteSettings.homeCategories.map((category, index) => (
              <Link 
                key={index} 
                to={`/shop?category=${category.name}`}
                className="category-card"
              >
                <div className="category-image">
                  {category.image ? (
                    <img src={category.image} alt={category.name} />
                  ) : (
                    <div className="category-placeholder">
                      <span>📷</span>
                      <p>Ajoutez une image via l'admin</p>
                    </div>
                  )}
                  <div className="category-overlay">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>{siteSettings.aboutTitle || 'À Propos de Nous'}</h2>
              <p>{siteSettings.aboutDescription}</p>
              
              <div className="about-features">
                {siteSettings.aboutFeatures?.map((feature, index) => (
                  <div key={index} className="feature">
                    <span className="feature-icon">{feature.icon}</span>
                    <div>
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-image">
              <img 
                src={siteSettings.aboutImage || 'https://via.placeholder.com/600x400/f5f2ed/2c2c2c?text=Ajoutez+votre+image'} 
                alt="À propos de Millie Shop" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prête à Trouver Vos Chaussures Parfaites ?</h2>
            <p>Explorez notre collection et trouvez la paire qui vous correspond</p>
            <Link to="/shop" className="cta-button">
              Voir Toute la Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
