const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200],
    },
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z0-9-]+$/,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  shortDescription: {
    type: DataTypes.STRING(500),
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  comparePrice: {
    type: DataTypes.DECIMAL(10, 2),
    validate: {
      min: 0,
    },
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    validate: {
      min: 0,
    },
  },
  trackQuantity: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  weight: {
    type: DataTypes.DECIMAL(8, 3),
    validate: {
      min: 0,
    },
  },
  dimensions: {
    type: DataTypes.JSON, // { length, width, height, unit }
  },
  images: {
    type: DataTypes.JSON, // Array of image URLs
    defaultValue: [],
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id',
    },
  },
  vendorId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  tags: {
    type: DataTypes.JSON, // Array of tags
    defaultValue: [],
  },
  attributes: {
    type: DataTypes.JSON, // Custom product attributes
    defaultValue: {},
  },
  variants: {
    type: DataTypes.JSON, // Product variants (size, color, etc.)
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isDigital: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  requiresShipping: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  taxable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  taxClass: {
    type: DataTypes.STRING,
    defaultValue: 'standard',
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'archived'),
    defaultValue: 'draft',
  },
  publishedAt: {
    type: DataTypes.DATE,
  },
  metaTitle: {
    type: DataTypes.STRING,
    validate: {
      len: [0, 60],
    },
  },
  metaDescription: {
    type: DataTypes.STRING,
    validate: {
      len: [0, 160],
    },
  },
  searchKeywords: {
    type: DataTypes.TEXT,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  salesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5,
    },
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  hooks: {
    beforeCreate: (product) => {
      if (!product.slug && product.name) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }
      
      if (!product.sku) {
        product.sku = 'SKU-' + Date.now() + Math.floor(Math.random() * 1000);
      }

      if (product.status === 'active' && !product.publishedAt) {
        product.publishedAt = new Date();
      }
    },
    beforeUpdate: (product) => {
      if (product.changed('name') && !product.changed('slug')) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }

      if (product.changed('status') && product.status === 'active' && !product.publishedAt) {
        product.publishedAt = new Date();
      }
    },
  },
  indexes: [
    {
      fields: ['slug'],
      unique: true,
    },
    {
      fields: ['sku'],
      unique: true,
    },
    {
      fields: ['categoryId'],
    },
    {
      fields: ['vendorId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['isActive'],
    },
    {
      fields: ['isFeatured'],
    },
    {
      fields: ['price'],
    },
    {
      fields: ['createdAt'],
    },
    {
      fields: ['publishedAt'],
    },
    {
      name: 'product_search_idx',
      fields: ['name', 'description'],
      type: 'GIN',
    },
  ],
});

// Instance methods
Product.prototype.isInStock = function() {
  if (!this.trackQuantity) return true;
  return this.quantity > 0;
};

Product.prototype.isLowStock = function() {
  if (!this.trackQuantity) return false;
  return this.quantity <= this.lowStockThreshold;
};

Product.prototype.getDiscountPercentage = function() {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
};

Product.prototype.incrementView = async function() {
  this.viewCount += 1;
  await this.save({ fields: ['viewCount'] });
};

Product.prototype.updateRating = async function(newRating, isNewReview = false) {
  if (isNewReview) {
    this.reviewCount += 1;
    this.rating = ((this.rating * (this.reviewCount - 1)) + newRating) / this.reviewCount;
  } else {
    // Recalculate from all reviews (when a review is updated/deleted)
    const Review = require('./Review');
    const reviews = await Review.findAll({
      where: { productId: this.id },
      attributes: ['rating'],
    });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      this.rating = totalRating / reviews.length;
      this.reviewCount = reviews.length;
    } else {
      this.rating = 0;
      this.reviewCount = 0;
    }
  }
  
  await this.save({ fields: ['rating', 'reviewCount'] });
};

// Class methods
Product.findBySlug = function(slug) {
  return this.findOne({ 
    where: { slug, status: 'active', isActive: true },
    include: ['category'],
  });
};

Product.findFeatured = function(limit = 10) {
  return this.findAll({
    where: { 
      isFeatured: true, 
      status: 'active', 
      isActive: true 
    },
    limit,
    order: [['createdAt', 'DESC']],
    include: ['category'],
  });
};

Product.findByCategory = function(categoryId, options = {}) {
  const { limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
  
  return this.findAndCountAll({
    where: { 
      categoryId, 
      status: 'active', 
      isActive: true 
    },
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    include: ['category'],
  });
};

Product.search = function(query, options = {}) {
  const { limit = 20, offset = 0, categoryId, minPrice, maxPrice } = options;
  
  const where = {
    status: 'active',
    isActive: true,
  };

  if (query) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query}%` } },
      { description: { [Op.iLike]: `%${query}%` } },
      { searchKeywords: { [Op.iLike]: `%${query}%` } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice !== undefined) {
    where.price = { [Op.gte]: minPrice };
  }

  if (maxPrice !== undefined) {
    where.price = { ...where.price, [Op.lte]: maxPrice };
  }

  return this.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: ['category'],
  });
};

module.exports = Product;