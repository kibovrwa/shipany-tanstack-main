import { m } from '@/paraglide/messages.js';

export function SeedanceFaq() {
  const faqs = [
    {
      q: m['landing.faq.create.question'](),
      a: m['landing.faq.create.answer'](),
    },
    {
      q: m['landing.faq.unique.question'](),
      a: m['landing.faq.unique.answer'](),
    },
    {
      q: m['landing.faq.features.question'](),
      a: m['landing.faq.features.answer'](),
    },
    {
      q: m['landing.faq.cost.question'](),
      a: m['landing.faq.cost.answer'](),
    },
    {
      q: m['landing.faq.extras.question'](),
      a: m['landing.faq.extras.answer'](),
    },
    {
      q: m['landing.faq.models.question'](),
      a: m['landing.faq.models.answer'](),
    },
  ];

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {m['landing.faq.title']()}
        </h2>
        <div className="mt-10 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 open:border-purple-400/30"
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-white marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {faq.q}
                  <span className="text-muted-foreground text-lg transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
