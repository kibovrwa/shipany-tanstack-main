import { createFileRoute } from '@tanstack/react-router';

import { WRAP_DEFAULT_VEHICLE } from '@/config/wrap';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { ToolPage } from '@/blocks/wrap/tool-page';

export const Route = createFileRoute('/tesla-wrap-colors')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.footer.colors']({}, { locale }),
      description: m['wrap.editor.gradient_title']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/tesla-wrap-colors',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: () => (
    <ToolPage
      title={m['wrap.footer.colors']()}
      description={m['wrap.home.ideas_desc']()}
      ctaHref={`/editor/${WRAP_DEFAULT_VEHICLE}?panel=gradient`}
    >
      <p>{m['wrap.editor.gradient_apply']()}</p>
    </ToolPage>
  ),
});
