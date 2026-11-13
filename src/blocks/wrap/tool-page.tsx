import { Link } from '@/core/i18n/navigation';
import { WRAP_DEFAULT_VEHICLE } from '@/config/wrap';
import { m } from '@/paraglide/messages.js';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';

/** Lightweight marketing shell used by tool / guide routes. */
export function ToolPage({
  title,
  description,
  ctaHref,
  ctaLabel,
  children,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <PageShell>
      <PageIntro title={title} description={description}>
        <Link
          href={ctaHref ?? `/editor/${WRAP_DEFAULT_VEHICLE}`}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          {ctaLabel ?? m['wrap.vehicle.start']()}
        </Link>
      </PageIntro>
      {children ? (
        <section className="mx-auto max-w-3xl space-y-4 px-4 pb-24 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          {children}
        </section>
      ) : (
        <div className="pb-16" />
      )}
    </PageShell>
  );
}
