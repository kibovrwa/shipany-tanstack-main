import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';

const TOOLS = [
  { href: '/editor', labelKey: 'wrap.footer.select_vehicle' as const },
  { href: '/gallery', labelKey: 'wrap.footer.all_designs' as const },
  { href: '/plate', labelKey: 'wrap.footer.plate_gallery' as const },
  { href: '/plate/generate', labelKey: 'wrap.footer.plate_generator' as const },
  { href: '/photo-to-tesla-wrap', labelKey: 'wrap.footer.photo' as const },
  {
    href: '/ai-tesla-wrap-generator',
    labelKey: 'wrap.footer.ai_generator' as const,
  },
  {
    href: '/tesla-wrap-png-checker',
    labelKey: 'wrap.footer.png_checker' as const,
  },
  {
    href: '/tesla-wrap-templates',
    labelKey: 'wrap.footer.templates' as const,
  },
  { href: '/tesla-wrap-colors', labelKey: 'wrap.footer.colors' as const },
  {
    href: '/tesla-gradient-wrap',
    labelKey: 'wrap.footer.gradients' as const,
  },
];

export const Route = createFileRoute('/tools')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.nav.tools']({}, { locale }),
      description: m['wrap.footer.tools_downloads']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/tools',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <PageShell>
      <PageIntro
        title={m['wrap.nav.tools']()}
        description={m['wrap.footer.tools_downloads']()}
      />
      <section className="mx-auto grid w-full max-w-4xl gap-3 px-4 pb-24 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-xl border border-neutral-200 bg-white px-5 py-4 text-sm font-medium text-neutral-900 transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          >
            {m[tool.labelKey]()}
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
