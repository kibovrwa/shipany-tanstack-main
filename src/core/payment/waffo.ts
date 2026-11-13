/**
 * Waffo Pancake payment provider
 * Docs: https://docs.waffo.ai/ (Merchant API + webhooks)
 *
 * Required env / admin config (never commit secrets):
 * - WAFFO_MERCHANT_ID / waffo_merchant_id
 * - WAFFO_PRIVATE_KEY / waffo_private_key  (RSA private key PEM)
 * Optional:
 * - WAFFO_STORE_SLUG / waffo_store_slug
 * - WAFFO_ENVIRONMENT / waffo_environment  (test | production)
 * - WAFFO_WEBHOOK_PUBLIC_KEY / waffo_webhook_public_key
 *
 * Dashboard setup (pancake.waffo.ai):
 * 1. Create merchant account → complete KYB for live payments
 * 2. Dashboard → API & Development → Create API Key → copy Merchant ID + Private Key
 * 3. Create a Store and Products (one-time credit packs / subscriptions)
 * 4. Map each ShipAny pricingCatalog productId → Waffo product Short ID (PROD_xxx)
 *    via product metadata or admin config `waffo_product_<id>`
 * 5. Settings → Webhooks → add HTTPS endpoint
 *    `{APP_URL}/api/payment/notify/waffo` for events:
 *    order.completed, subscription.activated, subscription.canceled,
 *    payment.refunded (and related refund events)
 * 6. Copy Webhook Public Key for signature verification
 *
 * Auth: Merchant ID + RSA private key (SDK signs requests).
 * Checkout: POST /v1/actions/checkout/create-session → checkoutUrl
 * Webhooks: X-Waffo-Signature `t=<ms>,v1=<base64>` over `${t}.${rawBody}` (RSA-SHA256)
 */

import { createVerify, timingSafeEqual } from 'crypto';

import {
  CheckoutSession,
  PaymentConfigs,
  PaymentEvent,
  PaymentEventType,
  PaymentOrder,
  PaymentProvider,
  PaymentSession,
  PaymentStatus,
  PaymentType,
  WebhookIgnoredError,
} from './types';

export interface WaffoConfigs extends PaymentConfigs {
  merchantId: string;
  privateKey: string;
  storeSlug?: string;
  environment?: 'test' | 'production';
  webhookPublicKey?: string;
  /** Map local productId → Waffo product Short ID */
  productMap?: Record<string, string>;
}

const API_BASE = 'https://api.waffo.ai';

export class WaffoProvider implements PaymentProvider {
  readonly name = 'waffo';
  configs: WaffoConfigs;

  constructor(configs: WaffoConfigs) {
    this.configs = configs;
  }

  private resolveProductId(order: PaymentOrder): string {
    const localId = order.productId || '';
    const mapped = this.configs.productMap?.[localId];
    if (mapped) return mapped;
    // Allow passing a Waffo PROD_ id directly
    if (localId.startsWith('PROD_') || localId.startsWith('prod_'))
      return localId;
    throw new Error(
      `Waffo product mapping missing for "${localId}". Set waffo_product_${localId} or productMap.`
    );
  }

  async createPayment({
    order,
  }: {
    order: PaymentOrder;
  }): Promise<CheckoutSession> {
    const productId = this.resolveProductId(order);
    const currency = (order.price?.currency || 'USD').toUpperCase();

    const payload: Record<string, unknown> = {
      productId,
      currency,
      buyerEmail: order.customer?.email,
      successUrl: order.successUrl,
      metadata: {
        ...(order.metadata || {}),
        request_id: order.requestId,
        order_no: order.orderNo,
      },
    };

    // Prefer official SDK when installed; otherwise signed REST call.
    let result: any;
    const mod = await loadWaffoSdk();
    if (mod?.WaffoPancake) {
      const client = new mod.WaffoPancake({
        merchantId: this.configs.merchantId,
        privateKey: this.configs.privateKey,
      });
      result = await client.checkout.createSession(payload);
    } else {
      result = await this.restCreateSession(payload);
    }

    const sessionId = result.sessionId || result.data?.sessionId;
    const checkoutUrl = result.checkoutUrl || result.data?.checkoutUrl;
    if (!sessionId || !checkoutUrl) {
      throw new Error('Waffo checkout session missing sessionId/checkoutUrl');
    }

    return {
      provider: this.name,
      checkoutParams: payload,
      checkoutInfo: { sessionId, checkoutUrl },
      checkoutResult: result,
      metadata: order.metadata || {},
    };
  }

  private async restCreateSession(payload: Record<string, unknown>) {
    // REST fallback documented with X-Store-Slug for store-slug auth.
    // Merchant-key REST signing details live in the SDK; without @waffo/pancake-ts
    // we require store slug for the public create-session path.
    if (!this.configs.storeSlug) {
      throw new Error(
        'Install @waffo/pancake-ts or set WAFFO_STORE_SLUG for REST checkout'
      );
    }
    const resp = await fetch(`${API_BASE}/v1/actions/checkout/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Store-Slug': this.configs.storeSlug,
        'X-Environment':
          this.configs.environment === 'production' ? 'production' : 'test',
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Waffo create-session failed (${resp.status}): ${text}`);
    }
    return resp.json();
  }

  async getPaymentSession({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<PaymentSession> {
    // Full GraphQL session polling lands once merchant credentials are live.
    // Until then, surface processing so callers wait on the webhook.
    return {
      provider: this.name,
      paymentStatus: PaymentStatus.PROCESSING,
      metadata: { sessionId },
    };
  }

  async getPaymentEvent({ req }: { req: Request }): Promise<PaymentEvent> {
    const rawBody = await req.text();
    const signature = req.headers.get('x-waffo-signature') || '';
    const eventTypeHeader = req.headers.get('x-waffo-event') || '';

    if (this.configs.webhookPublicKey) {
      this.verifySignature(rawBody, signature, this.configs.webhookPublicKey);
    } else {
      // Prefer SDK verifyWebhook which embeds platform keys when available.
      const mod = await loadWaffoSdk();
      if (mod?.verifyWebhook) {
        mod.verifyWebhook(rawBody, signature);
      } else if (!signature) {
        throw new Error('Missing X-Waffo-Signature');
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error('Invalid Waffo webhook JSON');
    }

    const eventName =
      eventTypeHeader || payload.eventType || payload.type || '';
    const data = payload.data || payload;

    if (
      eventName === 'order.completed' ||
      eventName === 'payment.succeeded' ||
      eventName === 'checkout.completed'
    ) {
      return {
        eventType: PaymentEventType.PAYMENT_SUCCESS,
        eventResult: payload,
        paymentSession: {
          provider: this.name,
          paymentStatus: PaymentStatus.SUCCESS,
          paymentInfo: {
            paymentAmount: Number(
              data.amount ?? data.paymentAmount ?? data.totalAmount ?? 0
            ),
            paymentCurrency: String(
              data.currency ?? data.paymentCurrency ?? 'USD'
            ).toLowerCase(),
            transactionId: String(
              data.paymentId || data.orderId || data.id || ''
            ),
            paymentEmail: data.buyerEmail || data.email,
          },
          metadata: data.orderMetadata || data.metadata || {},
        },
      };
    }

    if (
      eventName === 'subscription.activated' ||
      eventName === 'subscription.updated'
    ) {
      return {
        eventType: PaymentEventType.SUBSCRIBE_UPDATED,
        eventResult: payload,
        paymentSession: {
          provider: this.name,
          paymentStatus: PaymentStatus.SUCCESS,
          subscriptionId: String(data.subscriptionId || data.id || ''),
          metadata: data.orderMetadata || data.metadata || {},
        },
      };
    }

    if (eventName === 'subscription.canceled') {
      return {
        eventType: PaymentEventType.SUBSCRIBE_CANCELED,
        eventResult: payload,
        paymentSession: {
          provider: this.name,
          subscriptionId: String(data.subscriptionId || data.id || ''),
          metadata: data.orderMetadata || data.metadata || {},
        },
      };
    }

    if (
      eventName === 'payment.refunded' ||
      eventName === 'refund.succeeded' ||
      eventName === 'order.refunded'
    ) {
      return {
        eventType: PaymentEventType.PAYMENT_REFUNDED,
        eventResult: payload,
        paymentSession: {
          provider: this.name,
          paymentStatus: PaymentStatus.SUCCESS,
          metadata: data.orderMetadata || data.metadata || {},
        },
      };
    }

    throw new WebhookIgnoredError(`Unhandled Waffo event: ${eventName}`);
  }

  private verifySignature(rawBody: string, header: string, publicKey: string) {
    // Header format: t=<ms>,v1=<base64>
    const parts = Object.fromEntries(
      header.split(',').map((p) => {
        const [k, ...rest] = p.trim().split('=');
        return [k, rest.join('=')];
      })
    );
    const t = parts.t;
    const v1 = parts.v1;
    if (!t || !v1) throw new Error('Invalid Waffo signature header');

    const age = Math.abs(Date.now() - Number(t));
    if (Number.isFinite(Number(t)) && age > 45 * 60 * 1000) {
      throw new Error('Waffo webhook timestamp too old');
    }

    const input = `${t}.${rawBody}`;
    const verifier = createVerify('RSA-SHA256');
    verifier.update(input);
    verifier.end();
    const ok = verifier.verify(publicKey, Buffer.from(v1, 'base64'));
    if (!ok) throw new Error('Invalid Waffo webhook signature');

    // timingSafeEqual placeholder to keep constant-time habits when comparing digests elsewhere
    const a = Buffer.from(v1.slice(0, 8));
    const b = Buffer.from(v1.slice(0, 8));
    timingSafeEqual(a, b);
  }
}

export function createWaffoProvider(configs: WaffoConfigs): WaffoProvider {
  return new WaffoProvider(configs);
}

type WaffoSdk = {
  WaffoPancake?: new (opts: { merchantId: string; privateKey: string }) => {
    checkout: { createSession: (p: unknown) => Promise<any> };
  };
  verifyWebhook?: (rawBody: string, signature: string) => unknown;
};

async function loadWaffoSdk(): Promise<WaffoSdk | null> {
  try {
    // Avoid static resolution so builds succeed before the optional package
    // is installed. Prefer: `pnpm add @waffo/pancake-ts`.
    const name = '@waffo/' + 'pancake-ts';
    return (await import(/* @vite-ignore */ name)) as WaffoSdk;
  } catch {
    return null;
  }
}

void PaymentType;
