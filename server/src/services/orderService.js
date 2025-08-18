import { Sequelize } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { Order, OrderItem, Product, User } from '../models/index.js';
import { ORDER_STATUS } from '../utils/constants.js';

export async function createOrder({ customerId, items }) {
  const sequelize = getSequelize();
  return sequelize.transaction(async (t) => {
    const order = await Order.create({ customerId, status: ORDER_STATUS.PENDING, totalAmount: 0 }, { transaction: t });
    let total = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!product || product.stock < item.quantity) {
        const err = new Error('Insufficient stock');
        err.status = 400;
        throw err;
      }
      const unitPrice = Number(product.price);
      total += unitPrice * item.quantity;
      await OrderItem.create({ OrderId: order.id, ProductId: product.id, quantity: item.quantity, unitPrice }, { transaction: t });
      await product.update({ stock: product.stock - item.quantity }, { transaction: t });
    }
    await order.update({ totalAmount: total.toFixed(2) }, { transaction: t });
    return order;
  });
}

export async function getOrderById(id, requesterId) {
  const order = await Order.findByPk(id, { include: [{ model: OrderItem, include: [Product] }, { model: User, as: 'customer' }] });
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  if (order.customerId !== requesterId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return order;
}

export async function listUserOrders(customerId) {
  return Order.findAll({ where: { customerId }, order: [['createdAt', 'DESC']], include: [{ model: OrderItem, include: [Product] }] });
}

export async function markOrderPaid(orderId) {
  const order = await Order.findByPk(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  await order.update({ status: ORDER_STATUS.PAID });
  return order;
}

