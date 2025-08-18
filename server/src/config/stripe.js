import Stripe from 'stripe';

let stripe;
export function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
    stripe = new Stripe(key, { apiVersion: '2024-06-20' });
  }
  return stripe;
}

