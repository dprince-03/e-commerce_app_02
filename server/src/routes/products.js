const express = require('express');
const { body, query } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticateToken, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with pagination and filtering
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category ID or slug
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, name, createdAt, rating]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sortBy').optional().isIn(['price', 'name', 'createdAt', 'rating']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
], validate, optionalAuth, productController.getProducts);

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
router.get('/search', [
  query('q').notEmpty().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], validate, productController.searchProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Product slug
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/slug/:slug', productController.getProductBySlug);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - categoryId
 *               - sku
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               price:
 *                 type: number
 *               comparePrice:
 *                 type: number
 *               costPrice:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               sku:
 *                 type: string
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               weight:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               lowStockThreshold:
 *                 type: integer
 *               allowBackorder:
 *                 type: boolean
 *               maxBackorder:
 *                 type: integer
 *               isDigital:
 *                 type: boolean
 *               digitalFile:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', [
  authenticateToken,
  authorize('ADMIN', 'MODERATOR'),
  body('name').trim().notEmpty().isLength({ min: 2, max: 200 }),
  body('description').trim().notEmpty().isLength({ min: 10, max: 5000 }),
  body('shortDescription').optional().trim().isLength({ max: 500 }),
  body('price').isFloat({ min: 0 }),
  body('comparePrice').optional().isFloat({ min: 0 }),
  body('costPrice').optional().isFloat({ min: 0 }),
  body('categoryId').notEmpty(),
  body('sku').trim().notEmpty(),
  body('brand').optional().trim(),
  body('model').optional().trim(),
  body('weight').optional().isFloat({ min: 0 }),
  body('stockQuantity').optional().isInt({ min: 0 }),
  body('lowStockThreshold').optional().isInt({ min: 0 }),
  body('allowBackorder').optional().isBoolean(),
  body('maxBackorder').optional().isInt({ min: 0 }),
  body('isDigital').optional().isBoolean(),
  body('digitalFile').optional().trim(),
], validate, upload.array('images', 10), productController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               price:
 *                 type: number
 *               comparePrice:
 *                 type: number
 *               costPrice:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               sku:
 *                 type: string
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               weight:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               lowStockThreshold:
 *                 type: integer
 *               allowBackorder:
 *                 type: boolean
 *               maxBackorder:
 *                 type: integer
 *               isDigital:
 *                 type: boolean
 *               digitalFile:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 */
router.put('/:id', [
  authenticateToken,
  authorize('ADMIN', 'MODERATOR'),
  body('name').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 5000 }),
  body('shortDescription').optional().trim().isLength({ max: 500 }),
  body('price').optional().isFloat({ min: 0 }),
  body('comparePrice').optional().isFloat({ min: 0 }),
  body('costPrice').optional().isFloat({ min: 0 }),
  body('categoryId').optional().notEmpty(),
  body('sku').optional().trim().notEmpty(),
  body('brand').optional().trim(),
  body('model').optional().trim(),
  body('weight').optional().isFloat({ min: 0 }),
  body('stockQuantity').optional().isInt({ min: 0 }),
  body('lowStockThreshold').optional().isInt({ min: 0 }),
  body('allowBackorder').optional().isBoolean(),
  body('maxBackorder').optional().isInt({ min: 0 }),
  body('isDigital').optional().isBoolean(),
  body('digitalFile').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
], validate, productController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 */
router.delete('/:id', [
  authenticateToken,
  authorize('ADMIN'),
], productController.deleteProduct);

/**
 * @swagger
 * /api/products/{id}/images:
 *   post:
 *     summary: Add images to product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 */
router.post('/:id/images', [
  authenticateToken,
  authorize('ADMIN', 'MODERATOR'),
], upload.array('images', 10), productController.addProductImages);

/**
 * @swagger
 * /api/products/{id}/images/{imageId}:
 *   delete:
 *     summary: Remove image from product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product or image not found
 */
router.delete('/:id/images/:imageId', [
  authenticateToken,
  authorize('ADMIN', 'MODERATOR'),
], productController.removeProductImage);

/**
 * @swagger
 * /api/products/{id}/variants:
 *   post:
 *     summary: Add variant to product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - attributes
 *               - price
 *               - stockQuantity
 *             properties:
 *               sku:
 *                 type: string
 *               attributes:
 *                 type: object
 *               price:
 *                 type: number
 *               comparePrice:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Variant added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product not found
 */
router.post('/:id/variants', [
  authenticateToken,
  authorize('ADMIN', 'MODERATOR'),
  body('sku').trim().notEmpty(),
  body('attributes').isObject(),
  body('price').isFloat({ min: 0 }),
  body('comparePrice').optional().isFloat({ min: 0 }),
  body('stockQuantity').isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
], validate, productController.addProductVariant);

/**
 * @swagger
 * /api/products/{id}/variants/{variantId}:
 *   put:
 *     summary: Update product variant (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *               attributes:
 *                 type: object
 *               price:
 *                 type: number
 *               comparePrice:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Variant updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product or variant not found
 */
router.put('/:id/variants/:variantId', [
  authenticateToken,
  authorize('ADMIN', 'MODERATOR'),
  body('sku').optional().trim().notEmpty(),
  body('attributes').optional().isObject(),
  body('price').optional().isFloat({ min: 0 }),
  body('comparePrice').optional().isFloat({ min: 0 }),
  body('stockQuantity').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
], validate, productController.updateProductVariant);

/**
 * @swagger
 * /api/products/{id}/variants/{variantId}:
 *   delete:
 *     summary: Remove product variant (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Variant removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Product or variant not found
 */
router.delete('/:id/variants/:variantId', [
  authenticateToken,
  authorize('ADMIN', 'MODERATOR'),
], productController.removeProductVariant);

module.exports = router;