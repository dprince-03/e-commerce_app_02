import { DataTypes } from 'sequelize';
import { USER_ROLES, ORDER_STATUS } from '../utils/constants.js';

export let User;
export let Product;
export let Category;
export let Order;
export let OrderItem;
export let Payment;

export function initModels(sequelize) {
  User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM(...Object.values(USER_ROLES)), defaultValue: USER_ROLES.CUSTOMER }
  });

  Category = sequelize.define('Category', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
  });

  Product = sequelize.define('Product', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    imageUrl: { type: DataTypes.STRING, allowNull: true }
  });

  Product.belongsTo(Category, { foreignKey: { allowNull: true } });
  Category.hasMany(Product);

  Order = sequelize.define('Order', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    status: { type: DataTypes.ENUM(...Object.values(ORDER_STATUS)), defaultValue: ORDER_STATUS.PENDING },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
  });

  Order.belongsTo(User, { as: 'customer' });
  User.hasMany(Order, { foreignKey: 'customerId' });

  OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  });

  OrderItem.belongsTo(Order);
  Order.hasMany(OrderItem);
  OrderItem.belongsTo(Product);
  Product.hasMany(OrderItem);

  Payment = sequelize.define('Payment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    provider: { type: DataTypes.STRING, allowNull: false },
    providerPaymentId: { type: DataTypes.STRING, allowNull: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'usd' },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'created' }
  });

  Payment.belongsTo(Order);
  Order.hasMany(Payment);
}

