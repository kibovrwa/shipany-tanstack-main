import { Sparkles } from 'lucide-react';

import { getWrapVehicle, WRAP_DEFAULT_VEHICLE } from '@/config/wrap';
import { getWrapDesign } from '@/config/wrap-gallery';
import { m } from '@/paraglide/messages.js';
import { CopyRise } from '@/components/wrap/copy-rise';
import { HeroPlayground } from '@/components/wrap/hero-playground';

const HERO_DESIGNS = ['retro-sunset', 'midnight-circuit'];

export function Hero() {
  const vehicle = getWrapVehicle(WRAP_DEFAULT_VEHICLE)!;
  const stickerNames = {
    star: m['wrap.hero.sticker_star'](),
    bolt: m['wrap.hero.sticker_bolt'](),
    flame: m['wrap.hero.sticker_flame'](),
    heart: m['wrap.hero.sticker_heart'](),
  };

  return (
    <section className="relative overflow-hidden px-4 pt-8 pb-4 md:flex md:min-h-[70vh] md:items-center md:py-20">
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="relative z-10 w-full text-center md:w-[40%] md:pl-12 md:text-left">
          <div className="hero-ai-badge border-border bg-background text-foreground mb-10 inline-flex min-h-10 max-w-full items-center gap-2.5 rounded-full border px-4 py-2 text-xs">
            <Sparkles className="size-4 shrink-0" />
            <span data-hero-badge-text className="font-medium">
              <CopyRise text={m['wrap.hero.badge']()} />
            </span>
          </div>
          <h1
            data-hero-title
            className="mb-10 text-4xl leading-tight font-bold text-neutral-900 md:text-5xl md:whitespace-nowrap lg:text-6xl dark:text-white"
          >
            <CopyRise text={m['wrap.hero.title']()} />
          </h1>
          <p
            data-hero-rise
            className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-neutral-600 md:mx-0 md:text-xl dark:text-neutral-400"
          >
            {m['wrap.hero.description']()}
          </p>
          <div
            data-hero-rise
            style={{ '--rise-delay': '0.42s' } as React.CSSProperties}
            className="flex flex-col items-center gap-3 md:items-start"
          >
            <a
              href="#vehicles"
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-neutral-800 sm:px-8 sm:py-4 sm:text-lg dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              {m['wrap.hero.cta']()}
            </a>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              {m['wrap.hero.caption']()}
            </p>
          </div>
        </div>
        <div className="w-full md:absolute md:top-1/2 md:-right-12 md:w-[65%] md:-translate-y-[45%]">
          <HeroPlayground
            vehicle={vehicle}
            poster="/wrap/hero-poster.webp"
            editorHref={`/editor/${vehicle.slug}?panel=ai`}
            downloadName={`${vehicle.name} wrap`}
            options={[
              {
                id: 'original',
                title: m['wrap.hero.original'](),
                thumb: '/wrap/hero-original.webp',
              },
              ...HERO_DESIGNS.map((id) => {
                const design = getWrapDesign(id)!;
                return {
                  id,
                  title: design.title,
                  thumb: `/wrap/gallery/${id}.webp`,
                  recipe: design.recipe,
                };
              }),
            ]}
            labels={{
              preview: m['wrap.hero.preview_alt'](),
              tryWrap: m['wrap.hero.try_wrap'](),
              trySticker: m['wrap.hero.try_sticker'](),
              sticker: (name) =>
                m['wrap.hero.sticker']({ name: stickerNames[name] }),
              upload: m['wrap.hero.upload'](),
              aiDesign: m['wrap.nav.ai_design'](),
              download: m['wrap.hero.download'](),
              reset: m['wrap.hero.reset'](),
              hideTools: m['wrap.hero.hide_tools'](),
            }}
          />
        </div>
      </div>
    </section>
  );
}