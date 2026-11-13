import { createFileRoute } from '@tanstack/react-router';

import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { ToolPage } from '@/blocks/wrap/tool-page';

export const Route = createFileRoute('/tesla-wrap-templates')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.footer.templates']({}, { locale }),
      description: m['wrap.home.vehicles_desc']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/tesla-wrap-templates',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: () => (
    <ToolPage
      title={m['wrap.footer.templates']()}
      description={m['wrap.home.vehicles_desc']()}
      ctaHref="/editor"
      ctaLabel={m['wrap.footer.select_vehicle']()}
    >
      <p>{m['wrap.home.vehicles_caption']()}</p>
    </ToolPage>
  ),
});
