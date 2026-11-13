import { Link } from '@/core/i18n/navigation';
import { modelCatalog } from '@/config/showcase';
import { m } from '@/paraglide/messages.js';

export function SeedanceModels() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {m['landing.models.title']()}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/60">
          {m['landing.inspired.community']()}
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modelCatalog.map((model) => (
            <Link
              key={model.id}
              href={model.href}
              className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5 transition hover:border-[#F2CE5A]/40 hover:shadow-[0_0_40px_-18px_rgba(242,206,90,0.55)]"
            >
              <p className="text-[10px] tracking-wider text-[#F2CE5A]/80 uppercase">
                {model.kind}
              </p>
              <h3 className="mt-1 text-base font-semibold text-white group-hover:text-[#F2CE5A]">
                {model.name}
              </h3>
              <p className="mt-2 text-sm text-white/55">{model.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
