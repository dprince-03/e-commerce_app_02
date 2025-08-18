# E-commerce Platform (Backend & Frontend)

This repository contains a production-ready Node.js e-commerce platform. The current milestone delivers the backend service, including authentication, product management, and Dockerised PostgreSQL & Redis.

## Prerequisites

- Docker & Docker Compose
- Node.js >= 18, npm >= 9 (for local development outside Docker)

## Quick Start (Docker)

```bash
git clone <repo-url>
cd ecommerce-platform
cp .env.example .env
# Adjust environment variables if needed
docker-compose up --build
```

The API will be available at `http://localhost:5000/api`.

## Local Development Without Docker

```bash
npm install --prefix server
cp .env.example .env
npm run dev --prefix server
```

This uses `nodemon` for hot-reloading.

## API Endpoints (MVP)

| Method | Endpoint                | Description                  |
|--------|-------------------------|------------------------------|
| POST   | /api/auth/register      | Register a new user          |
| POST   | /api/auth/login         | User login                   |
| GET    | /api/products           | List all products            |
| GET    | /api/products/:id       | Get single product           |
| POST   | /api/products           | Create product (admin only)  |
| PUT    | /api/products/:id       | Update product (admin only)  |
| DELETE | /api/products/:id       | Delete product (admin only)  |

Further endpoints (orders, payments, analytics) will be implemented in subsequent milestones.

## Testing

```bash
npm test --prefix server
```

## License

MIT