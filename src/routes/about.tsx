import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';

export const Route = createFileRoute('/about')({
  loader: () => {
    const locale = getLocale();
    const brand = envConfigs.app_name;
    return {
      locale,
      title: m['wrap.home.about_title']({ brand }, { locale }),
      description: m['wrap.home.about_desc']({ brand }, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/about',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: AboutPage,
});

function AboutPage() {
  const brand = envConfigs.app_name;
  return (
    <PageShell>
      <PageIntro
        title={m['wrap.home.about_title']({ brand })}
        description={m['wrap.home.about_desc']({ brand })}
      />
      <section className="mx-auto max-w-3xl space-y-6 px-4 pb-24 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>{m['wrap.home.about_disclaimer']({ brand })}</p>
        <p>{m['wrap.home.ideas_desc']()}</p>
        <p>{m['wrap.home.howto_sub']()}</p>
      </section>
    </PageShell>
  );
}
