const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ),
    defaultValue: 'pending',
  },
  paymentStatus: {
    type: DataTypes.ENUM(
      'pending',
      'paid',
      'failed',
      'refunded',
      'partially_refunded'
    ),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.STRING,
  },
  paymentId: {
    type: DataTypes.STRING, // Stripe payment intent ID or similar
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  shippingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  couponCode: {
    type: DataTypes.STRING,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  // Billing Address
  billingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  // Shipping Address
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  shippingMethod: {
    type: DataTypes.STRING,
  },
  trackingNumber: {
    type: DataTypes.STRING,
  },
  shippedAt: {
    type: DataTypes.DATE,
  },
  deliveredAt: {
    type: DataTypes.DATE,
  },
  cancelledAt: {
    type: DataTypes.DATE,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
  },
  refundedAt: {
    type: DataTypes.DATE,
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  refundReason: {
    type: DataTypes.TEXT,
  },
}, {
  hooks: {
    beforeCreate: (order) => {
      if (!order.orderNumber) {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        order.orderNumber = `ORD-${timestamp}-${random}`;
      }
    },
    beforeUpdate: (order) => {
      if (order.changed('status')) {
        const now = new Date();
        switch (order.status) {
          case 'shipped':
            if (!order.shippedAt) order.shippedAt = now;
            break;
          case 'delivered':
            if (!order.deliveredAt) order.deliveredAt = now;
            break;
          case 'cancelled':
            if (!order.cancelledAt) order.cancelledAt = now;
            break;
        }
      }
    },
  },
  indexes: [
    {
      fields: ['orderNumber'],
      unique: true,
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['paymentStatus'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

// Instance methods
Order.prototype.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

Order.prototype.canBeRefunded = function() {
  return this.paymentStatus === 'paid' && ['delivered', 'shipped'].includes(this.status);
};

Order.prototype.getTotalWeight = async function() {
  const OrderItem = require('./OrderItem');
  const Product = require('./Product');
  
  const items = await OrderItem.findAll({
    where: { orderId: this.id },
    include: [{ model: Product, attributes: ['weight'] }],
  });

  return items.reduce((total, item) => {
    const weight = item.Product?.weight || 0;
    return total + (weight * item.quantity);
  }, 0);
};

Order.prototype.updateStatus = async function(newStatus, reason = null) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  if (reason) {
    if (newStatus === 'cancelled') {
      this.cancellationReason = reason;
    } else if (newStatus === 'refunded') {
      this.refundReason = reason;
    }
  }

  await this.save();

  // Log status change
  const OrderStatusHistory = require('./OrderStatusHistory');
  await OrderStatusHistory.create({
    orderId: this.id,
    fromStatus: oldStatus,
    toStatus: newStatus,
    reason,
    changedBy: 'system', // This should be updated to include user ID when called from API
  });

  return this;
};

Order.prototype.addTrackingNumber = async function(trackingNumber, shippingMethod = null) {
  this.trackingNumber = trackingNumber;
  if (shippingMethod) {
    this.shippingMethod = shippingMethod;
  }
  if (this.status === 'processing') {
    this.status = 'shipped';
    this.shippedAt = new Date();
  }
  await this.save();
};

// Class methods
Order.findByOrderNumber = function(orderNumber) {
  return this.findOne({ 
    where: { orderNumber },
    include: ['user', 'items'],
  });
};

Order.findByUser = function(userId, options = {}) {
  const { limit = 10, offset = 0 } = options;
  
  return this.findAndCountAll({
    where: { userId },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: ['items'],
  });
};

Order.getRevenueStats = async function(startDate, endDate) {
  const { Op, fn, col } = require('sequelize');
  
  const where = {
    paymentStatus: 'paid',
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

  const stats = await this.findAll({
    where,
    attributes: [
      [fn('COUNT', col('id')), 'totalOrders'],
      [fn('SUM', col('totalAmount')), 'totalRevenue'],
      [fn('AVG', col('totalAmount')), 'averageOrderValue'],
    ],
    raw: true,
  });

  return stats[0];
};

Order.getTopSellingProducts = async function(limit = 10, startDate = null, endDate = null) {
  const OrderItem = require('./OrderItem');
  const Product = require('./Product');
  const { Op, fn, col } = require('sequelize');

  const where = { paymentStatus: 'paid' };
  
  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  const results = await OrderItem.findAll({
    include: [
      {
        model: Order,
        where,
        attributes: [],
      },
      {
        model: Product,
        attributes: ['id', 'name', 'price', 'images'],
      },
    ],
    attributes: [
      'productId',
      [fn('SUM', col('quantity')), 'totalQuantity'],
      [fn('SUM', col('OrderItem.price')), 'totalRevenue'],
    ],
    group: ['productId', 'Product.id'],
    order: [[fn('SUM', col('quantity')), 'DESC']],
    limit,
  });

  return results;
};

module.exports = Order;