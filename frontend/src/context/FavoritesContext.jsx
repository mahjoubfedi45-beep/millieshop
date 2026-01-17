import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user, token]);

  const fetchFavorites = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (product) => {
    if (!user) {
      alert('Vous devez être connecté pour ajouter aux favoris');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product._id })
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(prev => [...prev, data]);
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout aux favoris');
    }
  };

  const removeFromFavorites = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.product._id !== productId));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du retrait des favoris');
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.product?._id === productId);
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        getFavoritesCount,
        fetchFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};