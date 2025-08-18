const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');

// Define associations
// User associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
User.hasMany(Product, { foreignKey: 'vendorId', as: 'products' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });

// Category associations
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Product associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.belongsTo(User, { foreignKey: 'vendorId', as: 'vendor' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

// Order associations
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Payment associations
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Additional models for comprehensive e-commerce functionality
const Cart = sequelize.define('Cart', {
  id: {
    type: sequelize.Sequelize.UUID,
    defaultValue: sequelize.Sequelize.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: sequelize.Sequelize.UUID,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  sessionId: {
    type: sequelize.Sequelize.STRING,
  },
  expiresAt: {
    type: sequelize.Sequelize.DATE,
  },
});

const CartItem = sequelize.define('CartItem', {
  id: {
    type: sequelize.Sequelize.UUID,
    defaultValue: sequelize.Sequelize.UUIDV4,
    primaryKey: true,
  },
  cartId: {
    type: sequelize.Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Carts',
      key: 'id',
    },
  },
  productId: {
    type: sequelize.Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
  },
  quantity: {
    type: sequelize.Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  variant: {
    type: sequelize.Sequelize.JSON,
  },
  price: {
    type: sequelize.Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
});

const Wishlist = sequelize.define('Wishlist', {
  id: {
    type: sequelize.Sequelize.UUID,
    defaultValue: sequelize.Sequelize.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: sequelize.Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  productId: {
    type: sequelize.Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
  },
});

const Review = sequelize.define('Review', {
  id: {
    type: sequelize.Sequelize.UUID,
    defaultValue: sequelize.Sequelize.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: sequelize.Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  productId: {
    type: sequelize.Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
  },
  orderId: {
    type: sequelize.Sequelize.UUID,
    references: {
      model: 'Orders',
      key: 'id',
    },
  },
  rating: {
    type: sequelize.Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  title: {
    type: sequelize.Sequelize.STRING,
  },
  comment: {
    type: sequelize.Sequelize.TEXT,
  },
  isVerifiedPurchase: {
    type: sequelize.Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isApproved: {
    type: sequelize.Sequelize.BOOLEAN,
    defaultValue: true,
  },
  helpfulCount: {
    type: sequelize.Sequelize.INTEGER,
    defaultValue: 0,
  },
});

const Address = sequelize.define('Address', {
  id: {
    type: sequelize.Sequelize.UUID,
    defaultValue: sequelize.Sequelize.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: sequelize.Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  type: {
    type: sequelize.Sequelize.ENUM('billing', 'shipping'),
    allowNull: false,
  },
  firstName: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
  company: {
    type: sequelize.Sequelize.STRING,
  },
  address1: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
  address2: {
    type: sequelize.Sequelize.STRING,
  },
  city: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
  state: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
  postalCode: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
  country: {
    type: sequelize.Sequelize.STRING,
    allowNull: false,
  },
  phone: {
    type: sequelize.Sequelize.STRING,
  },
  isDefault: {
    type: sequelize.Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

// Cart associations
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });

// CartItem associations
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Wishlist associations
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlist' });
Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlists' });

// Review associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });

// Address associations
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Payment,
  Cart,
  CartItem,
  Wishlist,
  Review,
  Address,
};