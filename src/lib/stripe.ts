import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY が設定されていません");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

export function getStripePriceId(): string {
  if (!process.env.STRIPE_PRICE_ID) {
    throw new Error("STRIPE_PRICE_ID が設定されていません");
  }
  return process.env.STRIPE_PRICE_ID;
}
