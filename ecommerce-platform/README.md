# E-commerce Platform

A full-stack, production-ready e-commerce platform built with Node.js, Express, PostgreSQL, and vanilla JavaScript. This platform follows industry best practices and provides a comprehensive solution for online retail businesses.

## 🌟 Features

### Core Functionality
- **User Management**: Registration, authentication, profile management with JWT
- **Product Catalog**: Advanced product management with categories, search, and filtering
- **Shopping Cart**: Persistent cart with local storage and user synchronization
- **Wishlist**: Save favorite products for later
- **Order Management**: Complete order lifecycle from cart to delivery
- **Payment Processing**: Secure payments with Stripe integration
- **Admin Dashboard**: Comprehensive admin panel for managing the platform
- **Responsive Design**: Mobile-first, responsive UI that works on all devices

### Technical Features
- **RESTful API**: Well-documented API with Swagger/OpenAPI specification
- **Real-time Updates**: Live inventory updates and notifications
- **Search & Filtering**: Advanced product search with multiple filters
- **Image Management**: Cloudinary integration for image uploads and optimization
- **Email System**: Automated emails for registration, orders, and notifications
- **Security**: JWT authentication, rate limiting, input validation, and CORS protection
- **Performance**: Optimized database queries, caching with Redis, and CDN ready
- **Monitoring**: Comprehensive logging and error tracking
- **Docker Support**: Full containerization with Docker and docker-compose

## 🏗️ Architecture

This platform follows a **Layered + Microservices Hybrid** architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Vanilla JS)  │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Redis Cache   │
                       └─────────────────┘
```

### Backend Architecture
```
Controllers → Services → Models → Database
     │
     ▼
Middleware (Auth, Validation, Error Handling)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Start with development tools (Adminer, Redis Commander)
   docker-compose --profile dev up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs
   - Adminer (DB): http://localhost:8080
   - Redis Commander: http://localhost:8081

### Option 2: Manual Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd server && npm install && cd ..
   ```

2. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE ecommerce_db;
   CREATE USER ecommerce_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database and other service configurations
   ```

4. **Start Redis server**
   ```bash
   redis-server
   ```

5. **Run the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or run separately
   npm run server:dev  # Backend only
   npm run client:dev  # Frontend only
   ```

## 📁 Project Structure

```
ecommerce-platform/
├── client/                          # Frontend application
│   ├── index.html                   # Homepage
│   ├── pages/                       # HTML pages
│   │   ├── login.html
│   │   ├── products.html
│   │   ├── cart.html
│   │   └── ...
│   ├── css/                         # Stylesheets
│   │   ├── main.css                 # Main styles
│   │   ├── components.css           # Component styles
│   │   └── responsive.css           # Responsive design
│   ├── js/                          # JavaScript files
│   │   ├── main.js                  # Main application logic
│   │   ├── auth.js                  # Authentication manager
│   │   ├── utils.js                 # Utility functions
│   │   └── animations/              # Animation scripts
│   └── assets/                      # Static assets
│
├── server/                          # Backend application
│   ├── src/
│   │   ├── controllers/             # Route handlers
│   │   ├── models/                  # Database models
│   │   ├── routes/                  # API routes
│   │   ├── services/                # Business logic
│   │   ├── middleware/              # Custom middleware
│   │   ├── utils/                   # Utility functions
│   │   ├── config/                  # Configuration files
│   │   └── app.js                   # Express app setup
│   ├── tests/                       # Test files
│   ├── scripts/                     # Database scripts
│   └── server.js                    # Entry point
│
├── docker-compose.yml               # Docker services configuration
├── nginx.conf                       # Nginx reverse proxy config
└── README.md                        # This file
```

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env` and update the values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Database Configuration

The application uses PostgreSQL with Sequelize ORM. Database models automatically sync when the application starts.

### Redis Configuration

Redis is used for:
- Session storage
- Caching frequently accessed data
- Rate limiting
- Cart data for anonymous users

## 📚 API Documentation

The API is fully documented with Swagger/OpenAPI. Access the interactive documentation at:
- Development: http://localhost:5000/api-docs
- Production: https://your-domain.com/api-docs

### Main API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

#### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin/Vendor)
- `PUT /api/products/:id` - Update product (Admin/Vendor)
- `DELETE /api/products/:id` - Delete product (Admin/Vendor)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products

#### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

#### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

## 🛡️ Security

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Customer, Vendor, Admin)
- Account lockout after failed login attempts
- Email verification for new accounts

### Security Measures
- Input validation and sanitization
- SQL injection protection with Sequelize ORM
- XSS protection with helmet.js
- CORS configuration
- Rate limiting on API endpoints
- Secure password hashing with bcrypt
- HTTPS ready configuration

### Data Protection
- Sensitive data encryption
- PCI DSS compliant payment processing
- GDPR compliance ready
- Secure file upload handling

## 🚀 Deployment

### Docker Deployment (Recommended)

1. **Production Environment Setup**
   ```bash
   # Create production environment file
   cp .env.example .env.production
   
   # Update with production values
   NODE_ENV=production
   DB_PASSWORD=secure_production_password
   JWT_SECRET=very_secure_production_jwt_secret
   ```

2. **Deploy with Docker Compose**
   ```bash
   # Build and start production services
   docker-compose -f docker-compose.yml up -d --build
   
   # Check service status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   ```

### Manual Deployment

1. **Prepare the server**
   ```bash
   # Install Node.js, PostgreSQL, Redis, and Nginx
   # Configure firewall and SSL certificates
   ```

2. **Deploy application**
   ```bash
   # Clone repository on server
   git clone <repository-url> /var/www/ecommerce
   cd /var/www/ecommerce
   
   # Install dependencies
   npm ci --production
   cd server && npm ci --production
   
   # Set up environment variables
   cp .env.example .env
   # Configure production values
   
   # Start with PM2
   npm install -g pm2
   pm2 start server/server.js --name ecommerce-api
   pm2 startup
   pm2 save
   ```

3. **Configure Nginx**
   ```nginx
   # Copy nginx.conf to /etc/nginx/sites-available/ecommerce
   # Enable site and restart Nginx
   sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run backend tests only
cd server && npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
- **Unit Tests**: Individual function and component testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Complete user workflow testing

## 📊 Monitoring & Logging

### Application Monitoring
- Health check endpoints
- Performance metrics
- Error tracking with Winston logger
- Database query monitoring

### Log Files
- Application logs: `server/logs/combined.log`
- Error logs: `server/logs/error.log`
- Access logs: Nginx access logs

### Metrics
- API response times
- Database connection pool status
- Cache hit/miss rates
- User activity metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database exists
psql -U postgres -l
```

**Redis Connection Issues**
```bash
# Check Redis status
redis-cli ping

# Check Redis configuration
redis-cli config get "*"
```

**Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Getting Help
- Check the [API documentation](http://localhost:5000/api-docs)
- Review application logs
- Check Docker container logs: `docker-compose logs [service-name]`
- Open an issue on GitHub

## 🔄 Updates & Maintenance

### Regular Maintenance
- Update dependencies regularly
- Monitor security vulnerabilities
- Backup database regularly
- Review and rotate API keys
- Monitor application performance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update
cd server && npm update

# Restart services
docker-compose down
docker-compose up -d --build
```

---

**Built with ❤️ for the e-commerce community**

This platform provides a solid foundation for building scalable e-commerce applications. It follows industry best practices and is designed to handle real-world production workloads.