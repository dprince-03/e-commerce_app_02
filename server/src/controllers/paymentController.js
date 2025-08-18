import { createPaymentIntent } from '../services/paymentService.js';
import { getOrderById } from '../services/orderService.js';

export async function createIntent(req, res, next) {
  try {
    const order = await getOrderById(req.body.orderId, req.user.id);
    const intent = await createPaymentIntent({ orderId: order.id, amount: order.totalAmount });
    res.status(201).json(intent);
  } catch (err) {
    next(err);
  }
}

