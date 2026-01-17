#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration du nouveau client
const CLIENT_CONFIG = {
  name: process.argv[2] || 'Nouveau Client',
  siteName: process.argv[3] || 'Ma Boutique',
  domain: process.argv[4] || 'ma-boutique',
  email: process.argv[5] || 'admin@ma-boutique.com',
  colors: {
    primary: process.argv[6] || '#2c2c2c',
    accent: process.argv[7] || '#c8a882'
  }
};

console.log('🚀 Création d\'un nouveau site client...');
console.log('👤 Client:', CLIENT_CONFIG.name);
console.log('🏪 Site:', CLIENT_CONFIG.siteName);
console.log('🌐 Domaine:', CLIENT_CONFIG.domain);

// Fonction pour remplacer le contenu dans les fichiers
function updateClientFiles() {
  // 1. Mettre à jour le titre du site
  const indexHtml = 'frontend/public/index.html';
  if (fs.existsSync(indexHtml)) {
    let content = fs.readFileSync(indexHtml, 'utf8');
    content = content.replace(/Alabina Shoes/g, CLIENT_CONFIG.siteName);
    content = content.replace(/Chaussures Tendance/g, `${CLIENT_CONFIG.siteName} - Boutique en ligne`);
    fs.writeFileSync(indexHtml, content);
    console.log('✅ Titre du site mis à jour');
  }

  // 2. Mettre à jour la configuration
  const apiConfig = 'frontend/src/config/api.js';
  if (fs.existsSync(apiConfig)) {
    let content = fs.readFileSync(apiConfig, 'utf8');
    content = content.replace(/alabina-backend-abc123/g, `${CLIENT_CONFIG.domain}-backend`);
    fs.writeFileSync(apiConfig, content);
    console.log('✅ Configuration API mise à jour');
  }

  // 3. Mettre à jour les paramètres par défaut
  const adminPanel = 'frontend/src/pages/AdminPanel.jsx';
  if (fs.existsSync(adminPanel)) {
    let content = fs.readFileSync(adminPanel, 'utf8');
    content = content.replace(/Alabina Shoes/g, CLIENT_CONFIG.siteName);
    content = content.replace(/admin@shop\.com/g, CLIENT_CONFIG.email);
    fs.writeFileSync(adminPanel, content);
    console.log('✅ Admin panel personnalisé');
  }

  // 4. Mettre à jour le package.json
  const packageJson = 'frontend/package.json';
  if (fs.existsSync(packageJson)) {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
    pkg.name = CLIENT_CONFIG.domain;
    pkg.description = `Site e-commerce pour ${CLIENT_CONFIG.siteName}`;
    fs.writeFileSync(packageJson, JSON.stringify(pkg, null, 2));
    console.log('✅ Package.json mis à jour');
  }
}

// Créer le script de déploiement personnalisé
function createDeployScript() {
  const deployScript = `#!/bin/bash

echo "🚀 Déploiement de ${CLIENT_CONFIG.siteName}"

# 1. Déployer le backend sur Render
echo "📡 Déploiement du backend..."
echo "URL Backend: https://${CLIENT_CONFIG.domain}-backend.onrender.com"

# 2. Déployer le frontend sur Vercel  
echo "🌐 Déploiement du frontend..."
echo "URL Frontend: https://${CLIENT_CONFIG.domain}.vercel.app"

# 3. Créer le compte admin
echo "👤 Informations Admin:"
echo "Email: ${CLIENT_CONFIG.email}"
echo "Mot de passe: admin123"
echo "URL Admin: https://${CLIENT_CONFIG.domain}.vercel.app/admin-panel"

echo "✅ Déploiement terminé pour ${CLIENT_CONFIG.name}!"
`;

  fs.writeFileSync('deploy-client.sh', deployScript);
  console.log('✅ Script de déploiement créé');
}

// Exécuter la personnalisation
updateClientFiles();
createDeployScript();

console.log('\n🎉 Site client prêt!');
console.log('\n📋 Prochaines étapes:');
console.log('1. git add . && git commit -m "Site personnalisé"');
console.log('2. Créer nouveau repo GitHub');
console.log('3. git remote set-url origin https://github.com/votre-username/nouveau-repo.git');
console.log('4. git push origin main');
console.log('5. Déployer sur Render + Vercel');
console.log('\n💰 Facturer au client: 2,000-5,000 TND');