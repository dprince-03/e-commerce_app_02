import { Router } from 'express';
import { me } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, me);

