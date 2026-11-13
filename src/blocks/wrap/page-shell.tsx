import type { CSSProperties, ReactNode } from 'react';

import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { FeedbackButton } from '@/blocks/wrap/home-sections';

/** Public page frame: announcement bar + nav, content, footer. */
export function PageShell({
  children,
  feedback = true,
}: {
  children: ReactNode;
  feedback?: boolean;
}) {
  return (
    <div className="text-foreground flex min-h-screen flex-col">
      <Header />
      <main
        className="flex flex-1 flex-col"
        style={{ background: 'var(--hero-bg)' } as CSSProperties}
      >
        {children}
      </main>
      <Footer />
      {feedback ? <FeedbackButton /> : null}
    </div>
  );
}

/** Centered title block used at the top of content pages. */
export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="px-4 pt-14 pb-10 text-center md:pt-20 md:pb-12">
      <div className="mx-auto max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl leading-tight font-bold text-neutral-900 md:text-5xl dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 md:text-lg dark:text-neutral-400">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}