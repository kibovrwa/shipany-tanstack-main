/**
 * Authoritative pricing catalog.
 *
 * The checkout API uses this as the SOURCE OF TRUTH for price/credits/duration.
 * Any price, credits, or plan info sent by the client is IGNORED — only the
 * product_id is honored, and everything else is looked up here.
 *
 * To change pricing, edit this file and redeploy. Admin UI cannot alter prices.
 *
 * Numbers mirror seevideo.ai public pricing (Starter / Pro / Unlimited +
 * Pay Once packs). Brand/copy stay swappable via messages + brand.ts.
 */

import { PaymentInterval, PaymentType } from '@/core/payment/types';

export type PricingPlanInfo = {
  name: string;
  interval: PaymentInterval;
  intervalCount: number;
};

export type PricingProduct = {
  productId: string;
  productName: string;
  planName: string;
  description: string;
  type: PaymentType;
  priceInCents: number;
  currency: string;
  /**
   * Price in fen for CNY-only providers (Alipay, WeChat Pay) when `currency`
   * isn't CNY. Without it those providers refuse the product — the amount is
   * never reused across currencies.
   */
  cnyPriceInCents?: number;
  credits: number;
  creditsValidDays?: number;
  plan?: PricingPlanInfo;
  /**
   * 'guest_post': a guest post package. Sold only through
   * /api/guest-posts/$id/checkout (tied to an approved submission); the
   * generic checkout refuses it.
   */
  kind?: 'guest_post';
  /** Guest post packages: most external links the article may contain. */
  maxLinks?: number;
};

/**
 * SeeVideo-style catalog. Keys MUST match what the pricing UI sends as product_id.
 */
export const pricingCatalog: Record<string, PricingProduct> = {
  starter_monthly: {
    productId: 'starter_monthly',
    productName: 'Starter',
    planName: 'Starter',
    description: 'Starter Monthly',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 2999,
    currency: 'usd',
    credits: 2500,
    plan: {
      name: 'Starter',
      interval: PaymentInterval.MONTH,
      intervalCount: 1,
    },
  },
  pro_monthly: {
    productId: 'pro_monthly',
    productName: 'Pro',
    planName: 'Pro',
    description: 'Pro Monthly',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 8999,
    currency: 'usd',
    credits: 10000,
    plan: { name: 'Pro', interval: PaymentInterval.MONTH, intervalCount: 1 },
  },
  unlimited_monthly: {
    productId: 'unlimited_monthly',
    productName: 'Unlimited',
    planName: 'Unlimited',
    description: 'Unlimited Monthly',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 14999,
    currency: 'usd',
    // Represent “unlimited” as a large monthly pool for ledger accounting.
    credits: 999999,
    plan: {
      name: 'Unlimited',
      interval: PaymentInterval.MONTH,
      intervalCount: 1,
    },
  },
  starter_yearly: {
    productId: 'starter_yearly',
    productName: 'Starter',
    planName: 'Starter',
    description: 'Starter Yearly ($100/year · ~$8.3/mo)',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 10000,
    currency: 'usd',
    credits: 10000,
    plan: { name: 'Starter', interval: PaymentInterval.YEAR, intervalCount: 1 },
  },
  pro_yearly: {
    productId: 'pro_yearly',
    productName: 'Pro',
    planName: 'Pro',
    description: 'Pro Yearly ($300/year · $25/mo)',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 30000,
    currency: 'usd',
    credits: 32000,
    plan: { name: 'Pro', interval: PaymentInterval.YEAR, intervalCount: 1 },
  },
  unlimited_yearly: {
    productId: 'unlimited_yearly',
    productName: 'Unlimited',
    planName: 'Unlimited',
    description: 'Unlimited Yearly ($900/year · $75/mo)',
    type: PaymentType.SUBSCRIPTION,
    priceInCents: 90000,
    currency: 'usd',
    credits: 999999,
    plan: {
      name: 'Unlimited',
      interval: PaymentInterval.YEAR,
      intervalCount: 1,
    },
  },
  credits_pack_standard: {
    productId: 'credits_pack_standard',
    productName: 'Credits Pack',
    planName: 'Pay Once Standard',
    description: 'One-time 23,500 credits',
    type: PaymentType.ONE_TIME,
    priceInCents: 19999,
    currency: 'usd',
    credits: 23500,
  },
  credits_pack_pro: {
    productId: 'credits_pack_pro',
    productName: 'Credits Pack',
    planName: 'Pay Once Pro',
    description: 'One-time 60,000 credits',
    type: PaymentType.ONE_TIME,
    priceInCents: 49999,
    currency: 'usd',
    credits: 60000,
  },

  // Guest posts (see src/modules/guest-posts). Published permanently, every
  // external link rendered rel="sponsored nofollow".
  guest_post_standard: {
    productId: 'guest_post_standard',
    productName: 'Guest Post',
    planName: 'Standard',
    description: 'Guest post (1 link)',
    type: PaymentType.ONE_TIME,
    priceInCents: 9900,
    currency: 'usd',
    cnyPriceInCents: 69900,
    credits: 0,
    kind: 'guest_post',
    maxLinks: 1,
  },
  guest_post_premium: {
    productId: 'guest_post_premium',
    productName: 'Guest Post',
    planName: 'Premium',
    description: 'Guest post (3 links)',
    type: PaymentType.ONE_TIME,
    priceInCents: 19900,
    currency: 'usd',
    cnyPriceInCents: 139900,
    credits: 0,
    kind: 'guest_post',
    maxLinks: 3,
  },
};

export function getPricingProduct(productId: string): PricingProduct | null {
  if (!productId) return null;
  return pricingCatalog[productId] ?? null;
}

export function listPricingProducts(): PricingProduct[] {
  return Object.values(pricingCatalog);
}

export function listGuestPostPackages(): PricingProduct[] {
  return listPricingProducts().filter((p) => p.kind === 'guest_post');
}
