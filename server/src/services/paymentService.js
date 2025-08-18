import { Payment } from '../models/index.js';
import { markOrderPaid } from './orderService.js';

export async function createPaymentIntent({ orderId, amount, currency = 'usd' }) {
  // Stripe stub: in production, integrate with Stripe SDK
  const payment = await Payment.create({ OrderId: orderId, provider: 'stripe', amount, currency, status: 'requires_payment_method' });
  return { id: payment.id, clientSecret: `pi_${payment.id}_secret_stub`, payment };
}

export async function handlePaymentWebhook({ provider, providerPaymentId, orderId, status }) {
  const payment = await Payment.findOne({ where: { id: providerPaymentId } });
  if (!payment) return;
  await payment.update({ status });
  if (status === 'succeeded') {
    await markOrderPaid(orderId);
  }
}

