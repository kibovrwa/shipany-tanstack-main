import { createFileRoute, notFound } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import {
  getWrapVehicle,
  WRAP_DEFAULT_VEHICLE,
  wrapVehicleLabel,
} from '@/config/wrap';
import { getWrapDesign, WRAP_DESIGNS } from '@/config/wrap-gallery';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { designCardData } from '@/blocks/wrap/home-sections';
import { PageShell } from '@/blocks/wrap/page-shell';
import { AuthorAvatar, DesignCard } from '@/components/wrap/design-card';

export const Route = createFileRoute('/gallery/$id')({
  loader: ({ params }) => {
    const design = getWrapDesign(params.id);
    if (!design) throw notFound();
    const vehicle = getWrapVehicle(design.vehicle);
    const locale = getLocale();
    const label = vehicle ? wrapVehicleLabel(vehicle) : design.vehicle;
    return {
      locale,
      design,
      vehicleLabel: label,
      title: `${design.title} · ${label}`,
      description: m['wrap.home.ideas_desc']({}, { locale }),
    };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? wrapPageHead({
          path: `/gallery/${params.id}`,
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
          image: `/wrap/gallery/${params.id}.webp`,
        })
      : {},
  component: GalleryDetailPage,
});

function GalleryDetailPage() {
  const { design, vehicleLabel } = Route.useLoaderData();
  const related = WRAP_DESIGNS.filter(
    (d) => d.category === design.category && d.id !== design.id
  ).slice(0, 8);

  return (
    <PageShell>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:py-16">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
          <img
            src={`/wrap/gallery/${design.id}.webp`}
            alt={design.title}
            width={1024}
            height={1024}
            className="aspect-square w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
            {design.category}
          </p>
          <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl dark:text-white">
            {design.title}
          </h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <AuthorAvatar author={design.author} className="size-7 text-xs" />
            <span>@{design.author}</span>
            <span className="text-neutral-400">·</span>
            <span>{vehicleLabel}</span>
          </div>
          <p className="mt-6 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            {m['wrap.home.ideas_desc']()}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/editor/${design.vehicle || WRAP_DEFAULT_VEHICLE}?design=${encodeURIComponent(design.id)}`}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              {m['wrap.vehicle.start']()}
            </Link>
            <Link
              href={`/gallery?vehicle=${encodeURIComponent(design.vehicle)}`}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-neutral-300 px-5 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
            >
              {m['wrap.home.view_all']()}
            </Link>
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="mx-auto w-full max-w-7xl px-4 pb-20">
          <h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-white">
            More {design.category}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-5">
            {related.map((item) => (
              <DesignCard key={item.id} design={designCardData(item)} />
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
