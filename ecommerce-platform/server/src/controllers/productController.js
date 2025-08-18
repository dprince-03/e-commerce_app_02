const { Product, Category, User, Review } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// @desc    Get all products with filters and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    category,
    minPrice,
    maxPrice,
    q,
    featured,
    inStock,
    rating,
  } = req.query;

  const offset = (page - 1) * limit;
  const where = { status: 'active', isActive: true };

  // Apply filters
  if (category) {
    where.categoryId = category;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
    if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
  }

  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { description: { [Op.iLike]: `%${q}%` } },
      { searchKeywords: { [Op.iLike]: `%${q}%` } },
    ];
  }

  if (featured === 'true') {
    where.isFeatured = true;
  }

  if (inStock === 'true') {
    where[Op.or] = [
      { trackQuantity: false },
      { quantity: { [Op.gt]: 0 } },
    ];
  }

  if (rating) {
    where.rating = { [Op.gte]: parseFloat(rating) };
  }

  const { rows: products, count } = await Product.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order: [[sortBy, sortOrder.toUpperCase()]],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: User,
        as: 'vendor',
        attributes: ['id', 'firstName', 'lastName'],
      },
    ],
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let product;

  // Check if ID is UUID or slug
  if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
          where: { isApproved: true },
          required: false,
          order: [['createdAt', 'DESC']],
          limit: 10,
        },
      ],
    });
  } else {
    product = await Product.findBySlug(id);
  }

  if (!product || product.status !== 'active' || !product.isActive) {
    throw new AppError('Product not found', 404);
  }

  // Increment view count
  await product.incrementView();

  // Get related products
  const relatedProducts = await Product.findAll({
    where: {
      categoryId: product.categoryId,
      id: { [Op.ne]: product.id },
      status: 'active',
      isActive: true,
    },
    limit: 8,
    order: [['rating', 'DESC'], ['salesCount', 'DESC']],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
    ],
  });

  res.json({
    success: true,
    data: {
      product,
      relatedProducts,
    },
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin/Vendor)
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    shortDescription,
    price,
    comparePrice,
    costPrice,
    categoryId,
    sku,
    quantity,
    lowStockThreshold,
    weight,
    dimensions,
    tags,
    attributes,
    variants,
    isActive,
    isFeatured,
    isDigital,
    requiresShipping,
    taxable,
    taxClass,
    metaTitle,
    metaDescription,
    searchKeywords,
  } = req.body;

  // Check if category exists
  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Check if SKU already exists
  if (sku) {
    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      throw new AppError('Product with this SKU already exists', 409);
    }
  }

  // Set vendor ID if user is vendor
  const vendorId = req.user.role === 'vendor' ? req.user.id : null;

  const product = await Product.create({
    name,
    description,
    shortDescription,
    price,
    comparePrice,
    costPrice,
    categoryId,
    vendorId,
    sku,
    quantity: quantity || 0,
    lowStockThreshold: lowStockThreshold || 10,
    weight,
    dimensions,
    tags: tags || [],
    attributes: attributes || {},
    variants: variants || [],
    isActive: isActive !== undefined ? isActive : true,
    isFeatured: isFeatured || false,
    isDigital: isDigital || false,
    requiresShipping: requiresShipping !== undefined ? requiresShipping : true,
    taxable: taxable !== undefined ? taxable : true,
    taxClass: taxClass || 'standard',
    status: req.user.role === 'admin' ? 'active' : 'draft',
    metaTitle,
    metaDescription,
    searchKeywords,
  });

  // Fetch the created product with associations
  const createdProduct = await Product.findByPk(product.id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: User,
        as: 'vendor',
        attributes: ['id', 'firstName', 'lastName'],
      },
    ],
  });

  logger.info(`Product created: ${product.name} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: {
      product: createdProduct,
    },
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Vendor - own products)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check ownership (vendor can only update their own products)
  if (req.user.role === 'vendor' && product.vendorId !== req.user.id) {
    throw new AppError('Not authorized to update this product', 403);
  }

  // Check if new category exists
  if (updates.categoryId) {
    const category = await Category.findByPk(updates.categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }

  // Check if new SKU is unique
  if (updates.sku && updates.sku !== product.sku) {
    const existingProduct = await Product.findOne({ 
      where: { 
        sku: updates.sku,
        id: { [Op.ne]: product.id },
      } 
    });
    if (existingProduct) {
      throw new AppError('Product with this SKU already exists', 409);
    }
  }

  // Update product
  await product.update(updates);

  // Fetch updated product with associations
  const updatedProduct = await Product.findByPk(product.id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: User,
        as: 'vendor',
        attributes: ['id', 'firstName', 'lastName'],
      },
    ],
  });

  logger.info(`Product updated: ${product.name} by ${req.user.email}`);

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: {
      product: updatedProduct,
    },
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin/Vendor - own products)
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check ownership
  if (req.user.role === 'vendor' && product.vendorId !== req.user.id) {
    throw new AppError('Not authorized to delete this product', 403);
  }

  // Soft delete (set isActive to false)
  await product.update({ isActive: false, status: 'archived' });

  logger.info(`Product deleted: ${product.name} by ${req.user.email}`);

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private (Admin/Vendor - own products)
const uploadProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check ownership
  if (req.user.role === 'vendor' && product.vendorId !== req.user.id) {
    throw new AppError('Not authorized to update this product', 403);
  }

  if (!req.files || req.files.length === 0) {
    throw new AppError('No images uploaded', 400);
  }

  // Process uploaded images (this would integrate with Cloudinary or similar)
  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
  
  // Update product images
  const currentImages = product.images || [];
  const updatedImages = [...currentImages, ...imageUrls];
  
  await product.update({ images: updatedImages });

  res.json({
    success: true,
    message: 'Images uploaded successfully',
    data: {
      images: updatedImages,
    },
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.findFeatured(parseInt(limit));

  res.json({
    success: true,
    data: {
      products,
    },
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
  } = req.query;

  const offset = (page - 1) * limit;

  const { rows: products, count } = await Product.findByCategory(categoryId, {
    limit: parseInt(limit),
    offset,
    sortBy,
    sortOrder: sortOrder.toUpperCase(),
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const {
    q,
    page = 1,
    limit = 20,
    categoryId,
    minPrice,
    maxPrice,
    sortBy = 'relevance',
  } = req.query;

  if (!q) {
    throw new AppError('Search query is required', 400);
  }

  const offset = (page - 1) * limit;

  const { rows: products, count } = await Product.search(q, {
    limit: parseInt(limit),
    offset,
    categoryId,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    data: {
      products,
      searchQuery: q,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const offset = (page - 1) * limit;

  const { rows: reviews, count } = await Review.findAndCountAll({
    where: { 
      productId: id,
      isApproved: true,
    },
    limit: parseInt(limit),
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName'],
      },
    ],
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getProductReviews,
};