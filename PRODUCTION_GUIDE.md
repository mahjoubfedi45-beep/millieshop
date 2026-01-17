# 🚀 Production Deployment Guide

This guide will help you deploy the Mode Shop e-commerce platform to production.

## 📋 Pre-deployment Checklist

### Security
- [ ] Change default admin credentials
- [ ] Set strong JWT secret
- [ ] Configure HTTPS/SSL
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure secure headers
- [ ] Set up environment variables properly

### Database
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure database backups
- [ ] Set up database monitoring
- [ ] Create database indexes for performance

### Email Service
- [ ] Configure production email service (SendGrid, Mailgun, etc.)
- [ ] Set up email templates
- [ ] Test email delivery

### File Storage
- [ ] Set up cloud storage (AWS S3, Cloudinary, etc.)
- [ ] Configure image optimization
- [ ] Set up CDN for static assets

## 🌐 Deployment Options

### Option 1: Heroku Deployment

#### Backend Deployment
1. Create a new Heroku app:
```bash
heroku create your-app-name-api
```

2. Set environment variables:
```bash
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_super_secure_jwt_secret
heroku config:set EMAIL_HOST=smtp.sendgrid.net
heroku config:set EMAIL_USER=apikey
heroku config:set EMAIL_PASS=your_sendgrid_api_key
heroku config:set NODE_ENV=production
```

3. Deploy:
```bash
git subtree push --prefix backend heroku main
```

#### Frontend Deployment (Netlify)
1. Build the project:
```bash
cd frontend && npm run build
```

2. Deploy to Netlify:
- Drag and drop the `build` folder to Netlify
- Or connect your GitHub repository

3. Configure redirects in `public/_redirects`:
```
/*    /index.html   200
```

### Option 2: VPS Deployment (Ubuntu)

#### Server Setup
1. Update system:
```bash
sudo apt update && sudo apt upgrade -y
```

2. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Install MongoDB:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

4. Install PM2:
```bash
sudo npm install -g pm2
```

#### Application Deployment
1. Clone repository:
```bash
git clone your-repository-url
cd mode-shop-ecommerce
```

2. Install dependencies:
```bash
npm run install-all
```

3. Build frontend:
```bash
npm run build
```

4. Configure environment:
```bash
cp backend/.env.example backend/.env
# Edit the .env file with your production values
```

5. Start with PM2:
```bash
pm2 start backend/server.js --name "mode-shop-api"
pm2 startup
pm2 save
```

#### Nginx Configuration
1. Install Nginx:
```bash
sudo apt install nginx
```

2. Create configuration file:
```bash
sudo nano /etc/nginx/sites-available/modeshop
```

3. Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/your/app/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

4. Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/modeshop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL Certificate (Let's Encrypt)
1. Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Get certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

### Option 3: Docker Deployment

#### Create Dockerfile for Backend
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### Create Dockerfile for Frontend
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: modeshop-db
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  backend:
    build: ./backend
    container_name: modeshop-api
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/ecommerce?authSource=admin
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: modeshop-web
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## 🔧 Production Optimizations

### Backend Optimizations
1. Enable compression:
```javascript
const compression = require('compression');
app.use(compression());
```

2. Add rate limiting:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

3. Add security headers:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Frontend Optimizations
1. Enable service worker for caching
2. Optimize images and use WebP format
3. Implement lazy loading
4. Use React.memo for expensive components
5. Implement code splitting

### Database Optimizations
1. Create indexes:
```javascript
// In MongoDB
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ category: 1 })
db.products.createIndex({ price: 1 })
db.orders.createIndex({ user: 1 })
db.orders.createIndex({ createdAt: -1 })
```

## 📊 Monitoring & Analytics

### Application Monitoring
1. Set up error tracking (Sentry)
2. Monitor performance (New Relic, DataDog)
3. Set up uptime monitoring
4. Configure log aggregation

### Business Analytics
1. Google Analytics integration
2. E-commerce tracking
3. Conversion funnel analysis
4. Customer behavior tracking

## 🔄 Backup Strategy

### Database Backups
1. Automated daily backups
2. Point-in-time recovery
3. Cross-region backup storage
4. Regular backup testing

### File Backups
1. User uploaded images
2. Application logs
3. Configuration files

## 🚨 Incident Response

### Monitoring Alerts
1. Server downtime
2. High error rates
3. Database connection issues
4. High response times

### Recovery Procedures
1. Database restoration
2. Application rollback
3. Traffic routing
4. Communication plan

## 📈 Scaling Considerations

### Horizontal Scaling
1. Load balancer configuration
2. Multiple server instances
3. Database clustering
4. CDN implementation

### Performance Optimization
1. Caching strategies (Redis)
2. Database query optimization
3. Image optimization and CDN
4. API response caching

## 🔐 Security Best Practices

### Application Security
1. Input validation and sanitization
2. SQL injection prevention
3. XSS protection
4. CSRF protection
5. Secure session management

### Infrastructure Security
1. Firewall configuration
2. VPN access for admin
3. Regular security updates
4. SSL/TLS configuration
5. Access logging and monitoring

## 📝 Maintenance Tasks

### Regular Tasks
- [ ] Security updates
- [ ] Database maintenance
- [ ] Log rotation
- [ ] Backup verification
- [ ] Performance monitoring
- [ ] SSL certificate renewal

### Monthly Tasks
- [ ] Security audit
- [ ] Performance review
- [ ] Backup testing
- [ ] Dependency updates
- [ ] Analytics review

---

🎉 **Congratulations!** Your Mode Shop e-commerce platform is now ready for production use!