import { createPaymentIntent, handleStripeWebhook } from '../services/paymentService.js';
import { getOrderById } from '../services/orderService.js';
import { getStripe } from '../config/stripe.js';

export async function createIntent(req, res, next) {
  try {
    const order = await getOrderById(req.body.orderId, req.user.id);
    const intent = await createPaymentIntent({ orderId: order.id, amount: order.totalAmount });
    res.status(201).json(intent);
  } catch (err) {
    next(err);
  }
}

export async function webhook(req, res, next) {
  try {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, secret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    await handleStripeWebhook(event);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

