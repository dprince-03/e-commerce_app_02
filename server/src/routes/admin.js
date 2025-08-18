import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { USER_ROLES } from '../utils/constants.js';
import { categoriesGet, categoriesUpsert, createProductAdmin, deleteProductAdmin, updateProductAdmin, usersList, userRoleUpdate } from '../controllers/adminController.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(USER_ROLES.ADMIN));

adminRouter.get('/users', usersList);
adminRouter.put('/users/:id/role', userRoleUpdate);

adminRouter.get('/categories', categoriesGet);
adminRouter.post('/categories', categoriesUpsert);
adminRouter.put('/categories', categoriesUpsert);

adminRouter.post('/products', createProductAdmin);
adminRouter.put('/products/:id', updateProductAdmin);
adminRouter.delete('/products/:id', deleteProductAdmin);

