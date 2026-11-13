import type { ReactNode } from 'react';
import { BadgeCheck, Check, Info, Loader2, Sparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';

export interface WrapPlanCard {
  id: string;
  tone: 'free' | 'featured' | 'member';
  name: string;
  price: string;
  /** Bold line under the price ("22 AI generations"). */
  headline: string;
  /** Small line under the headline ("220 credits"). */
  detail?: string;
  /** Green suffix on the detail line ("+20 bonus"). */
  bonus?: string;
  /** Tinted hint box under the detail. */
  hint?: string;
  /** Pill above the card ("Most Popular"). */
  topBadge?: string;
  /** Pill in the top-right corner ("Membership included"). */
  cornerBadge?: string;
  intro?: string;
  features: string[];
  /** Second feature group with its own heading. */
  extra?: { title: string; features: string[] };
  cta: string;
  /** A plain link instead of a purchase button. */
  href?: string;
}

export interface WrapPricingCardsProps {
  plans: WrapPlanCard[];
  loadingId?: string | null;
  onBuy: (plan: WrapPlanCard) => void;
  footnote?: ReactNode;
}

const cardTone: Record<WrapPlanCard['tone'], string> = {
  free: 'border border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white',
  featured:
    'border border-neutral-900 bg-neutral-900 text-white shadow-xl shadow-neutral-900/15 dark:border-white dark:bg-white dark:text-neutral-900',
  member:
    'border border-[#1D9BF0] bg-sky-50 text-neutral-900 ring-1 ring-inset ring-[#1D9BF0]',
};

const mutedTone: Record<WrapPlanCard['tone'], string> = {
  free: 'text-neutral-500 dark:text-neutral-400',
  featured: 'text-neutral-300 dark:text-neutral-600',
  member: 'text-neutral-600',
};

const dividerTone: Record<WrapPlanCard['tone'], string> = {
  free: 'border-neutral-200 dark:border-neutral-800',
  featured: 'border-white/15 dark:border-neutral-200',
  member: 'border-sky-200',
};

const checkTone: Record<WrapPlanCard['tone'], string> = {
  free: 'text-green-700 dark:text-green-400',
  featured: 'text-green-400 dark:text-green-700',
  member: 'text-[#1D9BF0]',
};

const buttonTone: Record<WrapPlanCard['tone'], string> = {
  free: 'border border-neutral-300 bg-transparent text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800',
  featured:
    'bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800',
  member: 'bg-[#1D9BF0] text-white hover:bg-[#1a8cd8]',
};

function FeatureList({
  features,
  tone,
}: {
  features: string[];
  tone: WrapPlanCard['tone'];
}) {
  return (
    <ul className="space-y-2">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2.5">
          <span className="flex h-[1lh] w-4 shrink-0 -translate-y-[0.5px] items-center justify-center">
            <Check className={cn('size-4', checkTone[tone])} />
          </span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

export function WrapPricingCards({
  plans,
  loadingId,
  onBuy,
  footnote,
}: WrapPricingCardsProps) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const buttonClass = cn(
            'mt-4 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70',
            buttonTone[plan.tone]
          );
          return (
            <article
              key={plan.id}
              className={cn(
                'relative flex min-w-0 flex-col rounded-2xl p-5 md:row-span-4 md:grid md:grid-rows-subgrid md:gap-y-0',
                cardTone[plan.tone]
              )}
            >
              {plan.topBadge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white">
                  {plan.topBadge}
                </span>
              ) : null}
              {plan.cornerBadge ? (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-sky-100 py-1 pr-2.5 pl-1.5 text-xs font-semibold text-sky-700">
                  <BadgeCheck className="size-3.5" />
                  {plan.cornerBadge}
                </span>
              ) : null}

              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-3 text-4xl font-bold tracking-tight">
                  {plan.price}
                </p>
              </div>

              <div>
                <p className="mt-1 text-base font-semibold">{plan.headline}</p>
                {plan.detail ? (
                  <p className={cn('mt-1 text-xs', mutedTone[plan.tone])}>
                    {plan.detail}
                    {plan.bonus ? (
                      <span
                        className={cn(
                          'ml-1 font-medium',
                          plan.tone === 'featured'
                            ? 'text-green-400 dark:text-green-700'
                            : 'text-green-700'
                        )}
                      >
                        {plan.bonus}
                      </span>
                    ) : null}
                  </p>
                ) : null}
                {plan.hint ? (
                  <p
                    className={cn(
                      'mt-2 flex items-start gap-2 rounded-lg px-3 py-1.5 text-xs leading-relaxed font-medium',
                      plan.tone === 'featured'
                        ? 'bg-sky-500/15 text-sky-300 dark:bg-sky-50 dark:text-sky-700'
                        : 'bg-sky-100 text-sky-700'
                    )}
                  >
                    <Sparkles className="mt-0.5 size-3.5 shrink-0" />
                    <span>{plan.hint}</span>
                  </p>
                ) : null}
              </div>

              <div
                className={cn(
                  'mt-4 flex-grow space-y-2 border-t pt-4 text-sm leading-relaxed',
                  dividerTone[plan.tone]
                )}
              >
                {plan.intro ? (
                  <p className={cn('text-xs font-medium', mutedTone[plan.tone])}>
                    {plan.intro}
                  </p>
                ) : null}
                <FeatureList features={plan.features} tone={plan.tone} />
                {plan.extra ? (
                  <>
                    <p
                      className={cn(
                        'pt-2 text-xs font-medium',
                        mutedTone[plan.tone]
                      )}
                    >
                      {plan.extra.title}
                    </p>
                    <FeatureList
                      features={plan.extra.features}
                      tone={plan.tone}
                    />
                  </>
                ) : null}
              </div>

              <div className="flex items-end">
                {plan.href ? (
                  <Link href={plan.href} className={buttonClass}>
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={!!loadingId}
                    onClick={() => onBuy(plan)}
                    className={buttonClass}
                  >
                    {loadingId === plan.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {plan.cta}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {footnote ? (
        <p className="mx-auto mt-8 flex max-w-3xl items-start justify-center gap-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>{footnote}</span>
        </p>
      ) : null}
    </>
  );
}