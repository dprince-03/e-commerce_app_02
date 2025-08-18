import express from 'express';
import { body } from 'express-validator';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post(
  '/',
  auth('admin'),
  [body('name').notEmpty(), body('price').isNumeric()],
  createProduct
);

router.put('/:id', auth('admin'), updateProduct);
router.delete('/:id', auth('admin'), deleteProduct);

export default router;