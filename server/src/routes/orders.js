import { Router } from 'express';
import { create, get, listMine } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

export const ordersRouter = Router();

ordersRouter.use(requireAuth);
ordersRouter.get('/me', listMine);
ordersRouter.get('/:id', get);
ordersRouter.post('/', create);

