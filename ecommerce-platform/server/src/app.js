import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Global middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'OK' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Error handler (should be last)
app.use(errorHandler);

export default app;