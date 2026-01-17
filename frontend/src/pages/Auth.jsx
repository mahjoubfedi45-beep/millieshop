import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData);
    }

    setLoading(false);

    if (result.success) {
      navigate('/shop');
    } else {
      setError(result.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isLogin ? 'Connexion' : 'Inscription'}</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Nom complet"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de passe (min 6 caractères)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />

          {!isLogin && (
            <>
              <input
                type="text"
                name="address"
                placeholder="Adresse"
                value={formData.address}
                onChange={handleChange}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={handleChange}
              />
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
          <button onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}>
            {isLogin ? 'S\'inscrire' : 'Se connecter'}
          </button>
        </p>

        {isLogin && (
          <div className="admin-login-info">
            <h4>🛠️ Accès Administrateur</h4>
            <p><strong>Email:</strong> admin@shop.com</p>
            <p><strong>Mot de passe:</strong> admin123</p>
            <small>Utilisez ces identifiants pour accéder au panneau d'administration</small>
          </div>
        )}
      </div>
    </div>
  );
}