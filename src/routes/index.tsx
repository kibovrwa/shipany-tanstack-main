import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Pricing } from '@/blocks/pricing';
import { Hero } from '@/blocks/wrap/hero';
import {
  AboutBox,
  GalleryMarquee,
  HomeCta,
  HomeFaq,
  HowTo,
  PngRequirements,
  VehicleGrid,
  WrapIdeas,
} from '@/blocks/wrap/home-sections';
import { PageShell } from '@/blocks/wrap/page-shell';

function HomePage() {
  return (
    <PageShell>
      <Hero />
      <GalleryMarquee />
      <WrapIdeas />
      <VehicleGrid />
      <HowTo />
      <Pricing />
      <PngRequirements />
      <HomeFaq />
      <AboutBox />
      <HomeCta />
    </PageShell>
  );
}

export const Route = createFileRoute('/')({
  loader: () => {
    const locale = getLocale();
    const brand = envConfigs.app_name;
    return {
      locale,
      title: m['wrap.home.meta_title']({ brand }, { locale }),
      description: m['wrap.home.meta_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
          bareTitle: true,
        })
      : {},
  component: HomePage,
});