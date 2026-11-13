import { createFileRoute } from '@tanstack/react-router';

import { WRAP_DEFAULT_VEHICLE } from '@/config/wrap';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { ToolPage } from '@/blocks/wrap/tool-page';

export const Route = createFileRoute('/photo-to-tesla-wrap')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.nav.photo']({}, { locale }),
      description: m['wrap.home.ideas_desc']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/photo-to-tesla-wrap',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: PhotoToWrapPage,
});

function PhotoToWrapPage() {
  return (
    <ToolPage
      title={m['wrap.nav.photo']()}
      description={m['wrap.home.ideas_desc']()}
      ctaHref={`/editor/${WRAP_DEFAULT_VEHICLE}?panel=assets`}
      ctaLabel={m['wrap.hero.upload']()}
    >
      <p>{m['wrap.home.step2_desc']()}</p>
      <p>{m['wrap.home.step3_desc']()}</p>
    </ToolPage>
  );
}
