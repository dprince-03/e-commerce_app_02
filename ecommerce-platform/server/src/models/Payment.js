const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  paymentIntentId: {
    type: DataTypes.STRING, // Stripe Payment Intent ID
    unique: true,
  },
  paymentMethodId: {
    type: DataTypes.STRING, // Stripe Payment Method ID
  },
  amount: {
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
  status: {
    type: DataTypes.ENUM(
      'pending',
      'processing',
      'succeeded',
      'failed',
      'cancelled',
      'refunded',
      'partially_refunded'
    ),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.ENUM(
      'card',
      'bank_transfer',
      'paypal',
      'apple_pay',
      'google_pay',
      'cash_on_delivery'
    ),
    allowNull: false,
  },
  gateway: {
    type: DataTypes.STRING,
    defaultValue: 'stripe',
  },
  gatewayTransactionId: {
    type: DataTypes.STRING,
  },
  gatewayResponse: {
    type: DataTypes.JSON, // Store full gateway response
  },
  failureReason: {
    type: DataTypes.STRING,
  },
  failureCode: {
    type: DataTypes.STRING,
  },
  refundedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  refundReason: {
    type: DataTypes.TEXT,
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  processedAt: {
    type: DataTypes.DATE,
  },
  refundedAt: {
    type: DataTypes.DATE,
  },
  // Card details (if applicable)
  cardLast4: {
    type: DataTypes.STRING(4),
  },
  cardBrand: {
    type: DataTypes.STRING,
  },
  cardExpMonth: {
    type: DataTypes.INTEGER,
  },
  cardExpYear: {
    type: DataTypes.INTEGER,
  },
  billingDetails: {
    type: DataTypes.JSON,
  },
}, {
  hooks: {
    beforeUpdate: (payment) => {
      if (payment.changed('status')) {
        const now = new Date();
        
        if (['succeeded', 'failed', 'cancelled'].includes(payment.status) && !payment.processedAt) {
          payment.processedAt = now;
        }
        
        if (['refunded', 'partially_refunded'].includes(payment.status) && !payment.refundedAt) {
          payment.refundedAt = now;
        }
      }
    },
  },
  indexes: [
    {
      fields: ['orderId'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['paymentIntentId'],
      unique: true,
    },
    {
      fields: ['status'],
    },
    {
      fields: ['paymentMethod'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

// Instance methods
Payment.prototype.isSuccessful = function() {
  return this.status === 'succeeded';
};

Payment.prototype.isFailed = function() {
  return ['failed', 'cancelled'].includes(this.status);
};

Payment.prototype.canBeRefunded = function() {
  return this.status === 'succeeded' && this.refundedAmount < this.amount;
};

Payment.prototype.getRemainingRefundAmount = function() {
  if (!this.canBeRefunded()) return 0;
  return this.amount - this.refundedAmount;
};

Payment.prototype.processRefund = async function(amount, reason = null) {
  if (!this.canBeRefunded()) {
    throw new Error('Payment cannot be refunded');
  }

  const maxRefundAmount = this.getRemainingRefundAmount();
  if (amount > maxRefundAmount) {
    throw new Error(`Refund amount cannot exceed ${maxRefundAmount}`);
  }

  this.refundedAmount = parseFloat(this.refundedAmount) + parseFloat(amount);
  
  if (this.refundedAmount >= this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }

  if (reason) {
    this.refundReason = reason;
  }

  await this.save();

  // Create refund record
  const Refund = require('./Refund');
  const refund = await Refund.create({
    paymentId: this.id,
    orderId: this.orderId,
    amount,
    reason,
    status: 'pending',
  });

  return refund;
};

// Class methods
Payment.findByOrder = function(orderId) {
  return this.findAll({
    where: { orderId },
    order: [['createdAt', 'DESC']],
  });
};

Payment.findByPaymentIntent = function(paymentIntentId) {
  return this.findOne({
    where: { paymentIntentId },
    include: ['order', 'user'],
  });
};

Payment.getRevenueStats = async function(startDate, endDate) {
  const { Op, fn, col } = require('sequelize');
  
  const where = {
    status: 'succeeded',
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

  const stats = await this.findAll({
    where,
    attributes: [
      [fn('COUNT', col('id')), 'totalPayments'],
      [fn('SUM', col('amount')), 'totalAmount'],
      [fn('AVG', col('amount')), 'averageAmount'],
      [fn('SUM', col('refundedAmount')), 'totalRefunded'],
    ],
    raw: true,
  });

  return stats[0];
};

Payment.getPaymentMethodStats = async function(startDate, endDate) {
  const { Op, fn, col } = require('sequelize');
  
  const where = {
    status: 'succeeded',
  };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  return this.findAll({
    where,
    attributes: [
      'paymentMethod',
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', col('amount')), 'totalAmount'],
    ],
    group: ['paymentMethod'],
    order: [[fn('COUNT', col('id')), 'DESC']],
  });
};

module.exports = Payment;