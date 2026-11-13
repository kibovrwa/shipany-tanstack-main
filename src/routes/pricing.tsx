import { createFileRoute } from '@tanstack/react-router';

import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Pricing } from '@/blocks/pricing';
import { SeedanceFooter } from '@/blocks/seedance-footer';
import { SeedanceHeader } from '@/blocks/seedance-header';

export const Route = createFileRoute('/pricing')({
  loader: () => {
    const locale = getLocale();
    return {
      title: m['landing.pricing.title']({}, { locale }),
      description: m['landing.pricing.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: 'description', content: loaderData.description },
        ]
      : [],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="seevideo-page flex min-h-screen flex-col bg-[#121317] text-[#fafafa]">
      <SeedanceHeader />
      <main className="flex-1">
        <Pricing />
      </main>
      <SeedanceFooter />
    </div>
  );
}
