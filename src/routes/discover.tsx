import { createFileRoute } from '@tanstack/react-router';

import { showcaseItems } from '@/config/showcase';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { SeedanceFooter } from '@/blocks/seedance-footer';
import { SeedanceHeader } from '@/blocks/seedance-header';

function DiscoverPage() {
  return (
    <div className="seedance-page min-h-screen bg-[#0a0a0a] text-[#fafafa]">
      <SeedanceHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <h1 className="text-3xl font-bold text-white">
          {m['landing.inspired.title']()}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
          {m['landing.inspired.description']()}
        </p>
        <div className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4">
          {showcaseItems.map((item) => (
            <div
              key={item.id}
              className="mb-3 break-inside-avoid overflow-hidden rounded-xl border border-white/10"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </main>
      <SeedanceFooter />
    </div>
  );
}

export const Route = createFileRoute('/discover')({
  loader: () => {
    const locale = getLocale();
    return { title: m['landing.inspired.title']({}, { locale }) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : [],
  }),
  component: DiscoverPage,
});
