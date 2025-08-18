# 🛍️ E-commerce Platform

A full-stack, production-ready e-commerce platform built with modern technologies and best practices.

## ✨ Features

### 🎯 Core E-commerce Features
- **Product Management**: Complete product catalog with variants, categories, and inventory
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Shopping Cart**: Persistent cart with real-time updates
- **Order Management**: Complete order lifecycle from cart to delivery
- **Payment Integration**: Stripe payment gateway with webhook support
- **User Profiles**: Customer accounts with order history and preferences
- **Wishlist**: Save and manage favorite products
- **Reviews & Ratings**: Product reviews with moderation system
- **Search & Filtering**: Advanced product search with multiple filters
- **Responsive Design**: Mobile-first design for all devices

### 🚀 Technical Features
- **Modern Architecture**: Layered architecture with microservices-ready design
- **Real-time Updates**: WebSocket support for live notifications
- **Image Processing**: Automatic image optimization and thumbnails
- **Caching**: Redis-based caching for improved performance
- **Rate Limiting**: API rate limiting and DDoS protection
- **Security**: Helmet.js, CORS, input validation, and SQL injection protection
- **Monitoring**: Comprehensive logging and error tracking
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing**: Unit, integration, and end-to-end tests
- **CI/CD Ready**: GitHub Actions workflow configuration

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+ (LTS)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + Passport.js
- **Payment**: Stripe SDK
- **File Upload**: Multer + Sharp (image processing)
- **Email**: SendGrid
- **Validation**: Joi + Express-validator
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **UI Components**: Custom component library
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library

### DevOps & Tools
- **Containerization**: Docker + Docker Compose
- **Database Management**: pgAdmin
- **Code Quality**: ESLint + Prettier
- **Version Control**: Git
- **Package Manager**: npm (with workspaces)

## 📁 Project Structure

```
ecommerce-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling
│   ├── public/            # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Custom middleware
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   ├── prisma/            # Database schema
│   ├── tests/             # Test files
│   └── package.json
├── shared/                 # Shared utilities
├── docs/                  # Documentation
├── docker-compose.yml     # Development environment
└── package.json           # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Docker and Docker Compose
- PostgreSQL (if not using Docker)
- Redis (if not using Docker)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce-platform
```

### 2. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Start Development Environment
```bash
# Start Docker services (PostgreSQL, Redis, pgAdmin)
npm run docker:up

# Install all dependencies
npm run install:all

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Start development servers
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **pgAdmin**: http://localhost:5050
  - Email: admin@ecommerce.com
  - Password: admin123

## 🔧 Configuration

### Environment Variables

#### Server Configuration
```env
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

#### Database Configuration
```env
DATABASE_URL="postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_db"
```

#### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

#### Stripe Configuration
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

#### Email Configuration
```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@ecommerce.com
```

## 📚 API Documentation

The API documentation is automatically generated using Swagger/OpenAPI and is available at:
- **Development**: http://localhost:5000/api-docs
- **Production**: https://your-domain.com/api-docs

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

#### Products
- `GET /api/products` - Get all products with pagination
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

#### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (Admin)

#### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

### Frontend Testing
```bash
cd client
npm test                   # Run all tests
npm run test:ui           # Run tests with UI
npm run test:coverage     # Run tests with coverage
```

### End-to-End Testing
```bash
npm run test:e2e          # Run E2E tests
```

## 🚀 Deployment

### Production Build
```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build production Docker image
docker build -t ecommerce-platform .

# Run production container
docker run -p 5000:5000 ecommerce-platform
```

### Environment Variables for Production
Make sure to set these environment variables in production:
- `NODE_ENV=production`
- Strong, unique `JWT_SECRET`
- Production database URLs
- Production API keys (Stripe, SendGrid, etc.)
- Proper CORS origins
- SSL certificates

## 🔒 Security Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Helmet.js**: Security headers and protection
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy headers
- **File Upload Security**: File type and size validation

## 📊 Performance Features

- **Database Optimization**: Efficient queries with Prisma
- **Caching**: Redis-based caching for frequently accessed data
- **Image Optimization**: Automatic image compression and thumbnails
- **Lazy Loading**: Code splitting and lazy loading
- **CDN Ready**: Static asset optimization
- **Compression**: Gzip compression for responses
- **Connection Pooling**: Database connection optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@ecommerce.com

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by industry best practices
- Community-driven development
- Open source contributors

---

**Happy Coding! 🚀**
