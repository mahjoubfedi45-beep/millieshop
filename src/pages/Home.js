import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const categories = [
    {
      name: 'Robes',
      image: 'https://images.unsplash.com/photo-1566479179817-c0ae8e5b4b8e?w=400',
      description: 'Robes élégantes pour toutes les occasions'
    },
    {
      name: 'Set',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
      description: 'Sets coordonnés tendance et chic'
    },
    {
      name: 'Nouvelle Collection',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
      description: 'Découvrez nos dernières créations'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Millie Shop</h1>
          <p>Mode Féminine & Élégance</p>
          <Link to="/shop" className="btn">
            Découvrir la Collection
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2>Nos Catégories</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                to={`/shop?category=${category.name}`}
                className="category-card"
              >
                <div className="category-image">
                  <img src={category.image} alt={category.name} />
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

      {/* About Section */}
      <section className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>À Propos de Nous</h2>
              <p>
                Millie Shop est votre destination pour la mode féminine en Tunisie. 
                Nous proposons une sélection soigneusement choisie de robes élégantes, 
                de sets coordonnés et de pièces de notre nouvelle collection.
              </p>
              <p>
                Chaque pièce est sélectionnée pour sa qualité, son style et son confort, 
                pour que chaque femme puisse exprimer sa personnalité avec élégance.
              </p>
            </div>
            <div className="about-image">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600" 
                alt="À propos de Millie Shop" 
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;