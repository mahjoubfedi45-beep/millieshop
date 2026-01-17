# Mode Shop - E-commerce Platform

A modern, full-stack e-commerce platform built with React and Node.js, featuring a complete shopping experience with user authentication, product management, cart functionality, and admin dashboard.

## 🚀 Features

### Customer Features
- **User Authentication**: Registration, login, and profile management
- **Product Browsing**: Advanced search, filtering, and pagination
- **Shopping Cart**: Add/remove items, quantity management
- **Favorites**: Save products for later
- **Order Management**: Place orders, track status, order history
- **Secure Checkout**: Payment processing simulation
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Dashboard**: Sales analytics and key metrics
- **Product Management**: CRUD operations with image upload
- **Order Management**: Status updates, tracking numbers
- **User Management**: Role management and user oversight
- **Bulk Operations**: Mass product updates and deletions
- **Data Export**: Order data export functionality
- **Settings**: Site configuration and preferences

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router DOM** - Client-side routing
- **Context API** - State management
- **CSS3** - Modern styling with gradients and animations
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email notifications

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
PORT=5000
JWT_SECRET=your_super_secure_jwt_secret_change_in_production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Mode Shop <your.email@gmail.com>
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (client/admin),
  address: String,
  phone: String,
  createdAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  stock: Number,
  createdAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId,
  items: [{
    product: ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  total: Number,
  shippingAddress: Object,
  paymentMethod: String,
  status: String,
  trackingNumber: String,
  createdAt: Date
}
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/cancel` - Cancel order
- `GET /api/orders` - Get all orders (admin)
- `PATCH /api/orders/:id/status` - Update order status (admin)

### Payment
- `POST /api/payment/create-order` - Create order
- `POST /api/payment/process-payment` - Process payment

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management
- `PATCH /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/export/orders` - Export orders

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with gradient backgrounds
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, animations, and transitions
- **Loading States**: Proper loading indicators and error handling
- **Form Validation**: Client and server-side validation
- **Toast Notifications**: User feedback for actions
- **Search & Filters**: Advanced product discovery
- **Pagination**: Efficient data loading

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation and sanitization
- **File Upload Security**: Restricted file types and sizes
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Sensitive data protection

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Configure MongoDB connection
3. Deploy using Git or CLI

### Frontend Deployment (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `build` folder
3. Configure redirects for SPA routing

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📈 Performance Optimizations

- **Image Optimization**: Compressed images and lazy loading
- **Code Splitting**: Dynamic imports for better loading
- **Caching**: Browser caching for static assets
- **Database Indexing**: Optimized queries
- **Pagination**: Efficient data loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@modeshop.com or create an issue on GitHub.

## 🔮 Future Enhancements

- [ ] Real payment gateway integration (Stripe/PayPal)
- [ ] Product reviews and ratings
- [ ] Wishlist sharing
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Social media integration
- [ ] Advanced search with Elasticsearch
- [ ] Inventory management
- [ ] Discount codes and promotions

---

**Mode Shop** - Your modern e-commerce solution 🛍️