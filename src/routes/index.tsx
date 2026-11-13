import { createFileRoute } from '@tanstack/react-router';

import { brand } from '@/config/brand';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { SeedanceCommunity } from '@/blocks/seedance-community';
import { SeedanceFaq } from '@/blocks/seedance-faq';
import { SeedanceFooter } from '@/blocks/seedance-footer';
import { SeedanceHeader } from '@/blocks/seedance-header';
import { SeedanceHero } from '@/blocks/seedance-hero';
import { SeedanceInspired } from '@/blocks/seedance-inspired';
import { SeedanceModels } from '@/blocks/seedance-models';

function HomePage() {
  return (
    <div className="seedance-page bg-[#0a0a0a] text-[#fafafa]">
      <SeedanceHeader />
      <main>
        <SeedanceHero />
        <SeedanceInspired />
        <SeedanceModels />
        <SeedanceCommunity />
        <SeedanceFaq />
      </main>
      <SeedanceFooter />
    </div>
  );
}

export const Route = createFileRoute('/')({
  loader: () => {
    const locale = getLocale();
    return {
      title: m['landing.meta.title']({}, { locale }),
      description: m['landing.meta.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? brand.name;
    const description = loaderData?.description ?? brand.tagline;
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
      ],
      links: locales.map((locale) => ({
        rel: 'alternate',
        hrefLang: locale,
        href: localizeUrl('/', { locale }).href,
      })),
    };
  },
  component: HomePage,
});
