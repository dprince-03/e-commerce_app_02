## E-commerce Platform (Node.js Monorepo)

Production-ready monorepo with an Express.js backend (PostgreSQL + Redis + JWT + Stripe stub) and a static frontend.

### Prerequisites
- Node.js LTS (>= 18)
- Docker + Docker Compose (for Postgres/Redis)

### Quick Start
1. Copy `.env.example` to `.env` and adjust values
2. Start infrastructure:
   - `docker compose up -d`
3. Install dependencies:
   - `npm install`
4. Initialize database (auto sync in dev):
   - `npm run dev:server`
5. Open frontend:
   - Open `client/index.html` in your browser (or serve via any static server)

### Scripts
- `npm run dev:server` - Run backend server with hot reload
- `npm run start:server` - Start backend server (production)
- `npm test` - Run tests

### Services
- Backend API: http://localhost:4000/api
- Swagger Docs: http://localhost:4000/docs
- Postgres: localhost:5432
- Redis: localhost:6379

### Tech Stack
- Backend: Express.js, Sequelize, PostgreSQL, Redis, JWT, Stripe (stub), Multer, Swagger
- Frontend: Static HTML/CSS/JS

### Notes
- In development `DB_SYNC=true` will auto-create tables via Sequelize. In production, disable it and use migrations.
- Stripe integration is optional and only enabled when `STRIPE_SECRET_KEY` is provided.

# e-commerce_app_02
vide coding 001
