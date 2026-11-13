import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const Route = createFileRoute('/faq')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.home.faq_title']({}, { locale }),
      description: m['wrap.home.about_desc'](
        { brand: envConfigs.app_name },
        { locale }
      ),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/faq',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: FaqPage,
});

function FaqPage() {
  const items = [
    { q: m['wrap.home.faq1_q'](), a: m['wrap.home.faq1_a']() },
    { q: m['wrap.home.faq2_q'](), a: m['wrap.home.faq2_a']() },
    { q: m['wrap.home.faq3_q'](), a: m['wrap.home.faq3_a']() },
    { q: m['wrap.home.faq4_q'](), a: m['wrap.home.faq4_a']() },
    { q: m['wrap.home.faq5_q'](), a: m['wrap.home.faq5_a']() },
  ];

  return (
    <PageShell>
      <PageIntro title={m['wrap.home.faq_title']()} />
      <section className="mx-auto w-full max-w-3xl px-4 pb-24">
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 dark:text-neutral-400">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PageShell>
  );
}
