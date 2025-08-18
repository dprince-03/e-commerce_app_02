import { Router } from 'express';
import { create, get, list, remove, update } from '../controllers/productController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../utils/constants.js';

export const productsRouter = Router();

productsRouter.get('/', list);
productsRouter.get('/:id', get);
productsRouter.post('/', requireAuth, requireRole(USER_ROLES.ADMIN), create);
productsRouter.put('/:id', requireAuth, requireRole(USER_ROLES.ADMIN), update);
productsRouter.delete('/:id', requireAuth, requireRole(USER_ROLES.ADMIN), remove);

