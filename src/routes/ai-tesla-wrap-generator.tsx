import { createFileRoute } from '@tanstack/react-router';

import { WRAP_DEFAULT_VEHICLE } from '@/config/wrap';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { ToolPage } from '@/blocks/wrap/tool-page';

export const Route = createFileRoute('/ai-tesla-wrap-generator')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.footer.ai_generator']({}, { locale }),
      description: m['wrap.editor.ai_placeholder']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/ai-tesla-wrap-generator',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: AiGeneratorPage,
});

function AiGeneratorPage() {
  return (
    <ToolPage
      title={m['wrap.footer.ai_generator']()}
      description={m['wrap.editor.ai_placeholder']()}
      ctaHref={`/editor/${WRAP_DEFAULT_VEHICLE}?panel=ai`}
      ctaLabel={m['wrap.nav.ai_design']()}
    >
      <p>{m['wrap.home.step2_desc']()}</p>
      <p>{m['wrap.editor.ai_cost']({ count: 10 })}</p>
    </ToolPage>
  );
}
