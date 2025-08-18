import { Router } from 'express';
import { createIntent, webhook } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

export const paymentsRouter = Router();

paymentsRouter.post('/intent', requireAuth, createIntent);
paymentsRouter.post('/webhook', webhook);

