import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import {
  getWrapVehicle,
  WRAP_EDITABLE_VEHICLES,
  wrapVehicleLabel,
} from '@/config/wrap';
import {
  WRAP_CATEGORIES,
  WRAP_DESIGNS,
  type WrapCategory,
} from '@/config/wrap-gallery';
import { cn } from '@/lib/utils';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { designCardData } from '@/blocks/wrap/home-sections';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';
import { DesignCard } from '@/components/wrap/design-card';

export const Route = createFileRoute('/gallery/')({
  validateSearch: (search: Record<string, unknown>) => ({
    vehicle: typeof search.vehicle === 'string' ? search.vehicle : undefined,
    category: typeof search.category === 'string' ? search.category : undefined,
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.home.gallery_title']({}, { locale }),
      description: m['wrap.home.gallery_sub']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/gallery',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: GalleryPage,
});

function GalleryPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? '');

  const designs = useMemo(() => {
    const query = (search.q ?? q).trim().toLowerCase();
    return WRAP_DESIGNS.filter((d) => {
      if (search.vehicle && d.vehicle !== search.vehicle) return false;
      if (search.category && d.category !== search.category) return false;
      if (!query) return true;
      return (
        d.title.toLowerCase().includes(query) ||
        d.author.toLowerCase().includes(query) ||
        d.id.includes(query)
      );
    });
  }, [search.vehicle, search.category, search.q, q]);

  function patchSearch(next: {
    vehicle?: string;
    category?: string;
    q?: string;
  }) {
    void navigate({
      search: {
        vehicle:
          next.vehicle === '' ? undefined : (next.vehicle ?? search.vehicle),
        category:
          next.category === '' ? undefined : (next.category ?? search.category),
        q: next.q === '' ? undefined : (next.q ?? search.q),
      },
    });
  }

  return (
    <PageShell>
      <PageIntro
        title={m['wrap.home.gallery_title']()}
        description={m['wrap.home.gallery_sub']()}
      >
        <p className="mt-3 text-sm text-neutral-500">
          {m['wrap.home.gallery_count']({ count: WRAP_DESIGNS.length })}
        </p>
      </PageIntro>

      <section className="mx-auto w-full max-w-7xl px-4 pb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') patchSearch({ q: q.trim() });
            }}
            placeholder="Search designs"
            className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-500 md:max-w-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={!search.vehicle}
              onClick={() => patchSearch({ vehicle: '' })}
            >
              All vehicles
            </FilterChip>
            {WRAP_EDITABLE_VEHICLES.slice(0, 8).map((v) => (
              <FilterChip
                key={v.slug}
                active={search.vehicle === v.slug}
                onClick={() => patchSearch({ vehicle: v.slug })}
              >
                {wrapVehicleLabel(v)}
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip
            active={!search.category}
            onClick={() => patchSearch({ category: '' })}
          >
            All styles
          </FilterChip>
          {WRAP_CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              active={search.category === c}
              onClick={() => patchSearch({ category: c })}
            >
              {c}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 px-4 pb-20 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
        {designs.map((design) => (
          <DesignCard key={design.id} design={designCardData(design)} />
        ))}
      </section>
      {designs.length === 0 ? (
        <p className="pb-20 text-center text-sm text-neutral-500">
          No designs match these filters.
        </p>
      ) : null}
      {search.vehicle && !getWrapVehicle(search.vehicle) ? (
        <p className="sr-only">Unknown vehicle filter</p>
      ) : null}
      {search.category &&
      !WRAP_CATEGORIES.includes(search.category as WrapCategory) ? (
        <p className="sr-only">Unknown category filter</p>
      ) : null}
    </PageShell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick(): void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
        active
          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
          : 'border-neutral-300 text-neutral-600 hover:border-neutral-500 dark:border-neutral-700 dark:text-neutral-300'
      )}
    >
      {children}
    </button>
  );
}
