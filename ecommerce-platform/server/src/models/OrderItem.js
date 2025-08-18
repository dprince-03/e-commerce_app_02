const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productSku: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productImage: {
    type: DataTypes.STRING,
  },
  variant: {
    type: DataTypes.JSON, // Selected variant details (size, color, etc.)
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
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
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  weight: {
    type: DataTypes.DECIMAL(8, 3),
    validate: {
      min: 0,
    },
  },
  isDigital: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  downloadUrl: {
    type: DataTypes.STRING, // For digital products
  },
  downloadExpiresAt: {
    type: DataTypes.DATE, // For digital products
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  maxDownloads: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
}, {
  hooks: {
    beforeCreate: (orderItem) => {
      orderItem.totalPrice = orderItem.price * orderItem.quantity;
    },
    beforeUpdate: (orderItem) => {
      if (orderItem.changed('price') || orderItem.changed('quantity')) {
        orderItem.totalPrice = orderItem.price * orderItem.quantity;
      }
    },
  },
  indexes: [
    {
      fields: ['orderId'],
    },
    {
      fields: ['productId'],
    },
  ],
});

// Instance methods
OrderItem.prototype.canDownload = function() {
  if (!this.isDigital || !this.downloadUrl) return false;
  
  // Check if download limit reached
  if (this.maxDownloads > 0 && this.downloadCount >= this.maxDownloads) {
    return false;
  }
  
  // Check if download expired
  if (this.downloadExpiresAt && new Date() > this.downloadExpiresAt) {
    return false;
  }
  
  return true;
};

OrderItem.prototype.incrementDownloadCount = async function() {
  this.downloadCount += 1;
  await this.save({ fields: ['downloadCount'] });
};

OrderItem.prototype.getSubtotal = function() {
  return this.totalPrice - this.discountAmount;
};

OrderItem.prototype.getGrandTotal = function() {
  return this.getSubtotal() + this.taxAmount;
};

// Class methods
OrderItem.findByOrder = function(orderId) {
  return this.findAll({
    where: { orderId },
    include: ['product'],
    order: [['createdAt', 'ASC']],
  });
};

OrderItem.findDigitalItems = function(orderId) {
  return this.findAll({
    where: { 
      orderId,
      isDigital: true,
    },
    include: ['product'],
  });
};

module.exports = OrderItem;