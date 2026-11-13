import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import { PLATE_DESIGNS } from '@/lib/wrap/plates';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';

export const Route = createFileRoute('/plate/')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.nav.plates']({}, { locale }),
      description: m['wrap.editor.plates_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/plate',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: PlateGalleryPage,
});

function PlateGalleryPage() {
  return (
    <PageShell>
      <PageIntro
        title={m['wrap.footer.plate_gallery']()}
        description={m['wrap.editor.plates_description']()}
      >
        <Link
          href="/plate/generate"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          {m['wrap.footer.plate_generator']()}
        </Link>
      </PageIntro>
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-4 pb-20 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {PLATE_DESIGNS.map((plate) => (
          <Link
            key={plate.id}
            href={`/plate/generate?preset=${plate.id}`}
            className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <img
              src={plate.cover}
              alt={plate.title}
              width={640}
              height={320}
              className="aspect-[2/1] w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="p-4">
              <h3 className="font-medium text-neutral-900 dark:text-white">
                {plate.title}
              </h3>
              <p className="mt-1 text-xs text-neutral-500">{plate.region}</p>
            </div>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
