import { createFileRoute, notFound, redirect } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import {
  getWrapVehicle,
  WRAP_DEFAULT_VEHICLE,
  wrapVehicleLabel,
} from '@/config/wrap';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';

/**
 * Info page for view-only vehicles (Cybercab, Roadster, Semi).
 * Editable vehicle slugs redirect into the designer.
 */
export const Route = createFileRoute('/$slug')({
  beforeLoad: ({ params }) => {
    const vehicle = getWrapVehicle(params.slug);
    if (vehicle?.editable) {
      throw redirect({
        to: '/editor/$slug',
        params: { slug: vehicle.slug },
      });
    }
  },
  loader: ({ params }) => {
    const vehicle = getWrapVehicle(params.slug);
    if (!vehicle || vehicle.editable) throw notFound();
    const locale = getLocale();
    const label = wrapVehicleLabel(vehicle);
    return {
      locale,
      vehicle,
      title: label,
      description: m['wrap.home.vehicles_desc']({}, { locale }),
    };
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? wrapPageHead({
          path: `/${params.slug}`,
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
          image: `/wrap/vehicles/${params.slug}.webp`,
        })
      : {},
  component: VehicleInfoPage,
});

function VehicleInfoPage() {
  const { vehicle } = Route.useLoaderData();
  const label = wrapVehicleLabel(vehicle);
  return (
    <PageShell>
      <PageIntro title={label} description={m['wrap.home.vehicles_desc']()} />
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pb-24">
        <img
          src={`/wrap/vehicles/${vehicle.slug}.webp`}
          alt={m['wrap.vehicle.alt']({ vehicle: label })}
          width={800}
          height={500}
          className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800"
        />
        <p className="text-center text-neutral-600 dark:text-neutral-400">
          {m['wrap_pages.vehicle.coming_soon']()}
        </p>
        <Link
          href={`/editor/${WRAP_DEFAULT_VEHICLE}`}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          {m['wrap.vehicle.start']()}
        </Link>
      </section>
    </PageShell>
  );
}
