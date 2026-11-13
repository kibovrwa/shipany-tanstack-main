import { createFileRoute, redirect } from '@tanstack/react-router';

import { WRAP_EDITABLE_VEHICLES, wrapVehicleLabel } from '@/config/wrap';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';
import { VehicleCard } from '@/components/wrap/vehicle-card';

export const Route = createFileRoute('/editor/')({
  validateSearch: (search: Record<string, unknown>) => ({
    vehicle: typeof search.vehicle === 'string' ? search.vehicle : undefined,
    panel: typeof search.panel === 'string' ? search.panel : undefined,
    share: search.share === '1' || search.share === true ? '1' : undefined,
  }),
  beforeLoad: ({ search }) => {
    // Deep links like /editor?vehicle=…&panel=ai jump straight into the tool.
    if (search.vehicle) {
      throw redirect({
        to: '/editor/$slug',
        params: { slug: search.vehicle },
        search: {
          ...(search.panel ? { panel: search.panel } : {}),
          ...(search.share ? { share: search.share } : {}),
        },
      });
    }
  },
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.editor.picker_meta_title']({}, { locale }),
      description: m['wrap.editor.picker_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/editor',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: EditorPickerPage,
});

function EditorPickerPage() {
  return (
    <PageShell feedback={false}>
      <PageIntro
        title={m['wrap.editor.picker_title']()}
        description={m['wrap.editor.picker_description']()}
      />
      <section className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 px-4 pb-20 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
        {WRAP_EDITABLE_VEHICLES.map((v) => (
          <VehicleCard
            key={v.slug}
            href={`/editor/${v.slug}`}
            name={v.name}
            variant={v.variant}
            image={`/wrap/vehicles/${v.slug}.webp`}
            action={m['wrap.editor.picker_cta']()}
            alt={m['wrap.vehicle.alt']({ vehicle: wrapVehicleLabel(v) })}
          />
        ))}
      </section>
    </PageShell>
  );
}
