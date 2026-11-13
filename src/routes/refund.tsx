import { createFileRoute } from '@tanstack/react-router';

import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';

export const Route = createFileRoute('/refund')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.footer.refund']({}, { locale }),
      description: m['wrap.pricing.faq5_a']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/refund',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: () => (
    <PageShell>
      <PageIntro
        title={m['wrap.footer.refund']()}
        description={m['wrap.pricing.faq5_a']()}
      />
      <section className="mx-auto max-w-3xl px-4 pb-24 text-neutral-600 dark:text-neutral-400">
        <p>{m['wrap.pricing.faq5_a']()}</p>
      </section>
    </PageShell>
  ),
});
