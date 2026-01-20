import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css';

// Simple test component first
function TestApp() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Millie Shop</h1>
      <p>Site en cours de chargement...</p>
      <p>Mode Féminine & Élégance</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TestApp />);