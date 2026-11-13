import { Link } from '@/core/i18n/navigation';
import { videoModels } from '@/config/showcase';
import { m } from '@/paraglide/messages.js';

export function SeedanceModels() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {m['landing.models.title']()}
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {videoModels.map((model) => (
            <Link
              key={model.id}
              href={model.href}
              className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5 transition hover:border-purple-400/40 hover:shadow-[0_0_40px_-18px_rgba(168,85,247,0.7)]"
            >
              <h3 className="text-base font-semibold text-white group-hover:text-purple-200">
                {model.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                {model.blurb}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
