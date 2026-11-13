import { Link } from '@/core/i18n/navigation';
import { showcaseItems } from '@/config/showcase';
import { m } from '@/paraglide/messages.js';

export function SeedanceInspired() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {m['landing.inspired.title']()}
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-sm sm:text-base">
          {m['landing.inspired.description']()}
        </p>
        <p className="mt-2 text-sm text-purple-300/80">
          {m['landing.inspired.community']()}
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-6xl columns-2 gap-3 sm:columns-3 lg:columns-4">
        {showcaseItems.map((item) => (
          <Link
            key={item.id}
            href="/discover"
            className="mb-3 block break-inside-avoid overflow-hidden rounded-xl border border-white/10 transition duration-300 hover:scale-[1.02] hover:border-purple-400/40"
          >
            <img
              src={item.src}
              alt={item.alt}
              className="w-full object-cover"
              loading="lazy"
            />
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/discover"
          className="text-sm font-medium text-purple-300 underline-offset-4 hover:underline"
        >
          {m['landing.inspired.cta']()}
        </Link>
      </div>
    </section>
  );
}
