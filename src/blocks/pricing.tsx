'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, Infinity as InfinityIcon, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
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
  PricingTable,
  type PricingGroup,
  type PricingPlan,
} from '@/components/pricing-table';

const ALL_PROVIDERS: PaymentProvider[] = [
  'waffo',
  'stripe',
  'creem',
  'paypal',
  'alipay',
  'wechat',
];

export function Pricing({ title }: { title?: string } = {}) {
  const router = useRouter();
  const { data: session } = useSession();

  const { data: configsData } = usePublicConfig();
  const configs = configsData ?? {};
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PricingPlan | null>(null);
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);

  const enabledProviders = useMemo<PaymentProvider[]>(
    () => ALL_PROVIDERS.filter((p) => configs[`${p}_enabled`] === 'true'),
    [configs]
  );

  const starterFeatures = [
    { icon: Sparkles, label: m['landing.pricing.feature_1_project']() },
    { icon: Zap, label: m['landing.pricing.feature_5k_credits']() },
    { icon: Check, label: m['landing.pricing.feature_email_support']() },
  ];
  const proFeatures = [
    {
      icon: Sparkles,
      label: m['landing.pricing.feature_unlimited_projects'](),
    },
    { icon: Zap, label: m['landing.pricing.feature_50k_credits']() },
    { icon: Check, label: m['landing.pricing.feature_priority_support']() },
    { icon: Check, label: m['landing.pricing.feature_api_access']() },
  ];
  const unlimitedFeatures = [
    {
      icon: Check,
      label: m['landing.pricing.feature_everything_pro'](),
    },
    {
      icon: InfinityIcon,
      label: m['landing.pricing.feature_unlimited_credits'](),
    },
    {
      icon: Zap,
      label: m['landing.pricing.feature_dedicated_support'](),
    },
    { icon: Check, label: m['landing.pricing.feature_custom_integrations']() },
  ];

  const groups: PricingGroup[] = [
    {
      key: 'monthly',
      label: m['landing.pricing.monthly'](),
      plans: [
        {
          id: 'starter-monthly',
          name: m['landing.pricing.starter'](),
          description: m['landing.pricing.starter_desc'](),
          price: '$29.99',
          interval: 'mo',
          features: starterFeatures,
          productId: 'starter_monthly',
          priceInCents: 2999,
          currency: 'usd',
          credits: 2500,
          plan: { name: 'Starter', interval: 'month', intervalCount: 1 },
        },
        {
          id: 'pro-monthly',
          name: m['landing.pricing.pro'](),
          description: m['landing.pricing.pro_desc'](),
          price: '$89.99',
          interval: 'mo',
          featured: true,
          badge: m['landing.pricing.popular'](),
          features: proFeatures,
          productId: 'pro_monthly',
          priceInCents: 8999,
          currency: 'usd',
          credits: 10000,
          plan: { name: 'Pro', interval: 'month', intervalCount: 1 },
        },
        {
          id: 'unlimited-monthly',
          name: m['landing.pricing.enterprise'](),
          description: m['landing.pricing.enterprise_desc'](),
          price: '$149.99',
          interval: 'mo',
          features: unlimitedFeatures,
          productId: 'unlimited_monthly',
          priceInCents: 14999,
          currency: 'usd',
          credits: 999999,
          plan: { name: 'Unlimited', interval: 'month', intervalCount: 1 },
        },
      ],
    },
    {
      key: 'yearly',
      label: m['landing.pricing.yearly'](),
      plans: [
        {
          id: 'starter-yearly',
          name: m['landing.pricing.starter'](),
          description: m['landing.pricing.starter_desc'](),
          price: '$8.3',
          originalPrice: '$29.99',
          interval: 'mo',
          features: [
            ...starterFeatures.slice(0, 1),
            { icon: Zap, label: '10,000 credits / year' },
            ...starterFeatures.slice(2),
          ],
          productId: 'starter_yearly',
          priceInCents: 10000,
          currency: 'usd',
          credits: 10000,
          plan: { name: 'Starter', interval: 'year', intervalCount: 1 },
        },
        {
          id: 'pro-yearly',
          name: m['landing.pricing.pro'](),
          description: m['landing.pricing.pro_desc'](),
          price: '$25',
          originalPrice: '$89.99',
          interval: 'mo',
          featured: true,
          badge: m['landing.pricing.popular'](),
          features: [
            ...proFeatures.slice(0, 1),
            { icon: Zap, label: '32,000 credits / year' },
            ...proFeatures.slice(2),
          ],
          productId: 'pro_yearly',
          priceInCents: 30000,
          currency: 'usd',
          credits: 32000,
          plan: { name: 'Pro', interval: 'year', intervalCount: 1 },
        },
        {
          id: 'unlimited-yearly',
          name: m['landing.pricing.enterprise'](),
          description: m['landing.pricing.enterprise_desc'](),
          price: '$75',
          originalPrice: '$149.99',
          interval: 'mo',
          badge: m['landing.pricing.best_value'](),
          features: unlimitedFeatures,
          productId: 'unlimited_yearly',
          priceInCents: 90000,
          currency: 'usd',
          credits: 999999,
          plan: { name: 'Unlimited', interval: 'year', intervalCount: 1 },
        },
      ],
    },
    {
      key: 'lifetime',
      label: m['landing.pricing.lifetime'](),
      plans: [
        {
          id: 'credits-pack-standard',
          name: 'Standard pack',
          description: '23,500 credits · one-time',
          price: '$199.99',
          features: [
            { icon: Sparkles, label: '23,500 credits' },
            { icon: Check, label: '3 concurrent generations' },
            { icon: Check, label: 'No watermark' },
          ],
          productId: 'credits_pack_standard',
          priceInCents: 19999,
          currency: 'usd',
          credits: 23500,
          buttonText: m['landing.pricing.buy_lifetime'](),
        },
        {
          id: 'credits-pack-pro',
          name: 'Pro pack',
          description: '60,000 credits · one-time',
          price: '$499.99',
          features: [
            { icon: Sparkles, label: '60,000 credits' },
            { icon: Check, label: '6 concurrent generations' },
            { icon: Check, label: 'No watermark' },
          ],
          featured: true,
          badge: m['landing.pricing.popular'](),
          productId: 'credits_pack_pro',
          priceInCents: 49999,
          currency: 'usd',
          credits: 60000,
          buttonText: m['landing.pricing.buy_lifetime'](),
        },
      ],
    },
  ];

  const checkoutMutation = useMutation({
    mutationFn: ({
      plan,
      provider,
    }: {
      plan: PricingPlan;
      provider: PaymentProvider;
    }) =>
      apiPost<{ checkout_url?: string }>('/api/payment/checkout', {
        product_id: plan.productId,
        product_name: plan.productName || plan.name,
        plan_name: plan.plan?.name || plan.name,
        price: plan.priceInCents,
        currency: plan.currency || 'usd',
        type: plan.plan ? 'subscription' : 'one-time',
        description: plan.name,
        plan: plan.plan,
        credits: plan.credits,
        credits_valid_days: plan.creditsValidDays,
        payment_provider: provider,
        redirect: '/settings/payments',
        locale: getLocale(),
      }),
    onSuccess: (data) => {
      if (!data?.checkout_url) {
        toast.error('Checkout failed');
        setLoadingProvider(null);
        return;
      }
      window.location.href = data.checkout_url;
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Checkout failed');
      setLoadingProvider(null);
    },
  });

  function startCheckout(plan: PricingPlan, provider: PaymentProvider) {
    setLoadingProvider(provider);
    checkoutMutation.mutate({ plan, provider });
  }

  async function handleCheckout(plan: PricingPlan) {
    if (!session?.user) {
      const callbackUrl = encodeURIComponent(currentPathWithQuery('/pricing'));
      router.push(`/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }

    const selectEnabled = configs.select_payment_enabled === 'true';
    const defaultProvider = (configs.default_payment_provider ||
      enabledProviders[0] ||
      'stripe') as PaymentProvider;

    if (selectEnabled && enabledProviders.length > 1) {
      setPendingPlan(plan);
      setModalOpen(true);
      return;
    }

    await startCheckout(plan, defaultProvider);
  }

  function handleProviderSelect(provider: PaymentProvider) {
    if (!pendingPlan) return;
    startCheckout(pendingPlan, provider);
  }

  return (
    <section
      id="pricing"
      className="border-t border-white/10 px-4 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-20 text-center">
          <h2 className="font-[family-name:var(--font-albert)] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {title ?? m['landing.pricing.title']()}
          </h2>
          <p className="mt-5 text-white/60">
            {m['landing.pricing.description']()}
          </p>
        </div>
        <PricingTable groups={groups} onCheckout={handleCheckout} />
      </div>

      <PaymentProviderModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setPendingPlan(null);
            setLoadingProvider(null);
          }
        }}
        providers={enabledProviders.length ? enabledProviders : ['stripe']}
        loadingProvider={loadingProvider}
        onSelect={handleProviderSelect}
        planName={pendingPlan?.name}
        price={pendingPlan?.price}
      />
    </section>
  );
}
