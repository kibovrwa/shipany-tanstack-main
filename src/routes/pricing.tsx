import { createFileRoute } from '@tanstack/react-router';

import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Pricing } from '@/blocks/pricing';
import { PageShell } from '@/blocks/wrap/page-shell';

export const Route = createFileRoute('/pricing')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.pricing.page_title']({}, { locale }),
      description: m['wrap.pricing.meta_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/pricing',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: PricingPage,
});

function PricingPage() {
  return (
    <PageShell>
      <Pricing />
    </PageShell>
  );
}
