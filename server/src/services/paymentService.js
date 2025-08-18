import { Payment, Order } from '../models/index.js';
import { markOrderPaid } from './orderService.js';
import { getStripe } from '../config/stripe.js';

export async function createPaymentIntent({ orderId, amount, currency = 'usd' }) {
  const stripe = getStripe();
  const order = await Order.findByPk(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100),
    currency,
    metadata: { orderId }
  });
  const payment = await Payment.create({ OrderId: orderId, provider: 'stripe', providerPaymentId: intent.id, amount, currency, status: intent.status });
  return { id: intent.id, clientSecret: intent.client_secret, payment };
}

export async function handleStripeWebhook(event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed':
    case 'payment_intent.canceled': {
      const intent = event.data.object;
      const payment = await Payment.findOne({ where: { providerPaymentId: intent.id } });
      if (!payment) return;
      await payment.update({ status: intent.status });
      if (intent.status === 'succeeded') {
        const orderId = intent.metadata?.orderId;
        if (orderId) await markOrderPaid(orderId);
      }
      break;
    }
    default:
      break;
  }
}

