import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { pricingCatalog } from '@/config/pricing';
import {
  WRAP_AI_CREDITS,
  WRAP_DEFAULT_VEHICLE,
  WRAP_MEMBERSHIP_SPEND_CENTS,
} from '@/config/wrap';
import { apiPost } from '@/lib/api-client';
import { currentPathWithQuery } from '@/lib/redirect';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { usePublicConfig } from '@/hooks/use-public-config';
import {
  PaymentProviderModal,
  type PaymentProvider,
} from '@/components/payment-provider-modal';
import {
  WrapPricingCards,
  type WrapPlanCard,
} from '@/components/wrap/pricing-cards';

const ALL_PROVIDERS: PaymentProvider[] = [
  'waffo',
  'stripe',
  'creem',
  'paypal',
  'alipay',
  'wechat',
];

/** Bonus credits included in each pack, shown next to the total. */
const PACK_BONUS: Record<string, number> = { starter: 20, pro: 50 };

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function Pricing({
  title,
  heading = true,
}: { title?: string; heading?: boolean } = {}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: configsData } = usePublicConfig();
  const configs = configsData ?? {};
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<WrapPlanCard | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);

  const enabledProviders = useMemo<PaymentProvider[]>(
    () => ALL_PROVIDERS.filter((p) => configs[`${p}_enabled`] === 'true'),
    [configs]
  );

  const starter = pricingCatalog.starter;
  const pro = pricingCatalog.pro;
  const memberAmount = formatUsd(WRAP_MEMBERSHIP_SPEND_CENTS);

  const plans: WrapPlanCard[] = [
    {
      id: 'free',
      tone: 'free',
      name: m['wrap.pricing.free'](),
      price: m['wrap.pricing.free_price'](),
      headline: m['wrap.pricing.free_note'](),
      detail: m['wrap.pricing.free_tagline'](),
      features: [
        m['wrap.pricing.free_f1'](),
        m['wrap.pricing.free_f2'](),
        m['wrap.pricing.free_f3'](),
        m['wrap.pricing.free_f4'](),
        m['wrap.pricing.free_f5'](),
        m['wrap.pricing.free_f6'](),
        m['wrap.pricing.free_f7'](),
      ],
      cta: m['wrap.pricing.free_cta'](),
      href: `/editor/${WRAP_DEFAULT_VEHICLE}`,
    },
    {
      id: starter.productId,
      tone: 'featured',
      name: m['wrap.pricing.starter'](),
      price: formatUsd(starter.priceInCents),
      headline: m['wrap.pricing.generations']({
        count: Math.floor(starter.credits / WRAP_AI_CREDITS),
      }),
      detail: m['wrap.pricing.credits']({ count: starter.credits }),
      bonus: m['wrap.pricing.bonus']({ count: PACK_BONUS.starter }),
      hint: m['wrap.pricing.unlock_hint']({ amount: memberAmount }),
      topBadge: m['wrap.pricing.popular'](),
      intro: m['wrap.pricing.starter_plus'](),
      features: [
        m['wrap.pricing.starter_f1'](),
        m['wrap.pricing.starter_f2'](),
        m['wrap.pricing.starter_f3'](),
        m['wrap.pricing.starter_f4'](),
        m['wrap.pricing.starter_f5'](),
      ],
      cta: m['wrap.pricing.starter_cta'](),
    },
    {
      id: pro.productId,
      tone: 'member',
      name: m['wrap.pricing.pro'](),
      price: formatUsd(pro.priceInCents),
      headline: m['wrap.pricing.generations']({
        count: Math.floor(pro.credits / WRAP_AI_CREDITS),
      }),
      detail: m['wrap.pricing.credits']({ count: pro.credits }),
      bonus: m['wrap.pricing.bonus']({ count: PACK_BONUS.pro }),
      cornerBadge: m['wrap.pricing.member_included'](),
      intro: m['wrap.pricing.pro_plus'](),
      features: [],
      extra: {
        title: m['wrap.pricing.pro_member'](),
        features: [
          m['wrap.pricing.pro_f1'](),
          m['wrap.pricing.pro_f2'](),
          m['wrap.pricing.pro_f3'](),
          m['wrap.pricing.pro_f4'](),
          m['wrap.pricing.pro_f5'](),
          m['wrap.pricing.pro_f6'](),
          m['wrap.pricing.pro_f7'](),
        ],
      },
      cta: m['wrap.pricing.pro_cta'](),
    },
  ];

  const checkoutMutation = useMutation({
    mutationFn: ({
      plan,
      provider,
    }: {
      plan: WrapPlanCard;
      provider?: PaymentProvider;
    }) =>
      // Only the product id matters: the server prices it from its catalog.
      apiPost<{ checkout_url?: string }>('/api/payment/checkout', {
        product_id: plan.id,
        payment_provider: provider,
        redirect: '/settings/payments',
        locale: getLocale(),
      }),
    onSuccess: (data) => {
      if (!data?.checkout_url) {
        toast.error(m['wrap.pricing.checkout_failed']());
        resetLoading();
        return;
      }
      window.location.href = data.checkout_url;
    },
    onError: (err: Error) => {
      toast.error(err?.message || m['wrap.pricing.checkout_failed']());
      resetLoading();
    },
  });

  function resetLoading() {
    setLoadingId(null);
    setLoadingProvider(null);
  }

  function startCheckout(plan: WrapPlanCard, provider?: PaymentProvider) {
    setLoadingId(plan.id);
    setLoadingProvider(provider ?? null);
    checkoutMutation.mutate({ plan, provider });
  }

  function handleBuy(plan: WrapPlanCard) {
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(currentPathWithQuery('/pricing'));
      router.push(`/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }
    if (
      configs.select_payment_enabled === 'true' &&
      enabledProviders.length > 1
    ) {
      setPendingPlan(plan);
      setModalOpen(true);
      return;
    }
    const configured = configs.default_payment_provider as
      | PaymentProvider
      | undefined;
    // With nothing chosen the server falls back to its own default provider.
    startCheckout(
      plan,
      configured && enabledProviders.includes(configured)
        ? configured
        : enabledProviders[0]
    );
  }

  return (
    <section id="pricing" className="bg-white px-4 py-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl">
        {heading ? (
          <h2 className="mb-12 text-center text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
            {title ?? m['wrap.pricing.title']()}
          </h2>
        ) : null}
        <WrapPricingCards
          plans={plans}
          loadingId={loadingId}
          onBuy={handleBuy}
          footnote={m['wrap.pricing.footnote']({ amount: memberAmount })}
        />
      </div>

      <PaymentProviderModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setPendingPlan(null);
            resetLoading();
          }
        }}
        providers={enabledProviders}
        loadingProvider={loadingProvider}
        onSelect={(provider) => pendingPlan && startCheckout(pendingPlan, provider)}
        planName={pendingPlan?.name}
        price={pendingPlan?.price}
      />
    </section>
  );
}