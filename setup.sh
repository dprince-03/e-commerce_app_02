#!/bin/bash

# E-commerce Platform Setup Script
# This script automates the initial setup of the e-commerce platform

set -e  # Exit on any error

echo "🚀 Starting E-commerce Platform Setup..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm 8+ first."
        exit 1
    fi
    
    NPM_VERSION=$(npm -v | cut -d'.' -f1)
    if [ "$NPM_VERSION" -lt 8 ]; then
        print_error "npm version 8+ is required. Current version: $(npm -v)"
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. You'll need to install PostgreSQL and Redis manually."
        DOCKER_AVAILABLE=false
    else
        print_success "Docker is installed"
        DOCKER_AVAILABLE=true
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        if [ "$DOCKER_AVAILABLE" = true ]; then
            print_warning "Docker Compose is not installed. You'll need to install it for easy database setup."
        fi
    else
        print_success "Docker Compose is installed"
        DOCKER_COMPOSE_AVAILABLE=true
    fi
}

# Create environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Environment file created from .env.example"
        
        # Generate random JWT secrets
        JWT_SECRET=$(openssl rand -base64 32)
        JWT_REFRESH_SECRET=$(openssl rand -base64 32)
        
        # Update .env file with generated secrets
        sed -i.bak "s/your-super-secret-jwt-key-change-in-production/$JWT_SECRET/g" .env
        sed -i.bak "s/your-super-secret-refresh-key-change-in-production/$JWT_REFRESH_SECRET/g" .env
        
        print_success "Generated secure JWT secrets"
    else
        print_warning "Environment file already exists, skipping creation"
    fi
}

# Start Docker services
start_docker_services() {
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        print_status "Starting Docker services..."
        
        # Check if Docker is running
        if ! docker info &> /dev/null; then
            print_error "Docker is not running. Please start Docker first."
            exit 1
        fi
        
        # Start services
        docker-compose up -d
        
        # Wait for services to be ready
        print_status "Waiting for services to be ready..."
        sleep 10
        
        # Check if services are running
        if docker-compose ps | grep -q "Up"; then
            print_success "Docker services started successfully"
        else
            print_error "Failed to start Docker services"
            exit 1
        fi
    else
        print_warning "Docker not available, skipping service startup"
        print_status "Please ensure PostgreSQL and Redis are running manually"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install server dependencies
    cd server
    npm install
    cd ..
    
    # Install client dependencies
    cd client
    npm install
    cd ..
    
    # Install shared dependencies
    cd shared
    npm install
    cd ..
    
    print_success "All dependencies installed successfully"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd server
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Run database migrations
    print_status "Running database migrations..."
    npx prisma migrate dev --name init
    
    # Seed database
    print_status "Seeding database with sample data..."
    npm run db:seed
    
    cd ..
    
    print_success "Database setup completed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd client
    npm run build
    cd ..
    
    print_success "Frontend built successfully"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Create uploads directory
    mkdir -p server/uploads/products
    mkdir -p server/uploads/avatars
    
    # Create logs directory
    mkdir -p server/logs
    
    # Create dist directory for client
    mkdir -p client/dist
    
    print_success "Directories created successfully"
}

# Setup Git hooks (optional)
setup_git_hooks() {
    if [ -d .git ]; then
        print_status "Setting up Git hooks..."
        
        # Create pre-commit hook for linting
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix the issues before committing."
    exit 1
fi
echo "Pre-commit checks passed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks configured"
    fi
}

# Display setup summary
display_summary() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "Your e-commerce platform is now ready!"
    echo ""
    echo "📁 Project Structure:"
    echo "  - Backend: ./server/"
    echo "  - Frontend: ./client/"
    echo "  - Shared: ./shared/"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Review and update .env file with your configuration"
    echo "  2. Start the development servers: npm run dev"
    echo "  3. Access the application:"
    echo "     - Frontend: http://localhost:3000"
    echo "     - Backend API: http://localhost:5000"
    echo "     - API Docs: http://localhost:5000/api-docs"
    echo ""
    
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        echo "🐳 Docker Services:"
        echo "  - PostgreSQL: localhost:5432"
        echo "  - Redis: localhost:6379"
        echo "  - pgAdmin: http://localhost:5050"
        echo "    - Email: admin@ecommerce.com"
        echo "    - Password: admin123"
        echo ""
    fi
    
    echo "📚 Documentation:"
    echo "  - README.md: Project overview and setup instructions"
    echo "  - API Docs: Swagger documentation at /api-docs"
    echo ""
    echo "🔧 Available Scripts:"
    echo "  - npm run dev: Start development servers"
    echo "  - npm run build: Build for production"
    echo "  - npm run test: Run tests"
    echo "  - npm run lint: Run linting"
    echo "  - npm run docker:up: Start Docker services"
    echo "  - npm run docker:down: Stop Docker services"
    echo ""
    echo "Happy coding! 🚀"
}

# Main setup function
main() {
    echo "Starting setup at $(date)"
    echo ""
    
    # Check requirements
    check_requirements
    
    # Setup environment
    setup_environment
    
    # Start Docker services if available
    start_docker_services
    
    # Create directories
    create_directories
    
    # Install dependencies
    install_dependencies
    
    # Setup database
    setup_database
    
    # Build frontend
    build_frontend
    
    # Setup Git hooks
    setup_git_hooks
    
    # Display summary
    display_summary
}

# Run setup
main "$@"