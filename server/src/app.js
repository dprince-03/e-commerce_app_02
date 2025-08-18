import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { usersRouter } from './routes/users.js';
import { paymentsRouter } from './routes/payments.js';
import { adminRouter } from './routes/admin.js';

export async function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  // capture raw body for Stripe webhooks
  app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/webhook') {
      let data = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => { data += chunk; });
      req.on('end', () => { req.rawBody = data; next(); });
    } else {
      express.json({ limit: '1mb' })(req, res, next);
    }
  });
  app.use(express.urlencoded({ extended: true }));

  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    max: Number(process.env.RATE_LIMIT_MAX || 120)
  });
  app.use(limiter);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/admin', adminRouter);

  // Serve frontend statically and index fallback
  const clientPath = new URL('../../client', import.meta.url).pathname;
  app.use('/', express.static(clientPath));
  app.get('/', (_req, res) => res.sendFile(clientPath + '/index.html'));

  app.use(errorHandler);

  return app;
}

