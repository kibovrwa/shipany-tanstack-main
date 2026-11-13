import { m } from '@/paraglide/messages.js';

export function SeedanceCommunity() {
  const points = [
    {
      title: m['landing.community.vision.title'](),
      body: m['landing.community.vision.body'](),
    },
    {
      title: m['landing.community.join.title'](),
      body: m['landing.community.join.body'](),
    },
    {
      title: m['landing.community.friends.title'](),
      body: m['landing.community.friends.body'](),
    },
    {
      title: m['landing.community.challenges.title'](),
      body: m['landing.community.challenges.body'](),
    },
    {
      title: m['landing.community.free.title'](),
      body: m['landing.community.free.body'](),
    },
    {
      title: m['landing.community.algorithms.title'](),
      body: m['landing.community.algorithms.body'](),
    },
    {
      title: m['landing.community.platforms.title'](),
      body: m['landing.community.platforms.body'](),
    },
  ];

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {m['landing.community.title']()}
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-center text-sm sm:text-base">
          {m['landing.community.description']()}
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <h3 className="text-base font-semibold text-purple-100">
                {point.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
