import { Link } from '@/core/i18n/navigation';
import { promptGallery } from '@/config/showcase';
import { m } from '@/paraglide/messages.js';

export function SeedanceInspired() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {m['landing.inspired.title']()}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/60 sm:text-base">
          {m['landing.inspired.description']()}
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2">
        {promptGallery.map((item) => (
          <Link
            key={item.id}
            href="/video"
            className="group overflow-hidden rounded-2xl border border-white/10 transition duration-300 hover:border-[#F2CE5A]/40"
          >
            <img
              src={item.src}
              alt={item.alt}
              className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/discover"
          className="text-sm font-medium text-[#F2CE5A] underline-offset-4 hover:underline"
        >
          {m['landing.inspired.cta']()}
        </Link>
      </div>
    </section>
  );
}
