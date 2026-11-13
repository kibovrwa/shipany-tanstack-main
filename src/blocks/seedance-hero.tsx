import { useState } from 'react';
import { Sparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { brand } from '@/config/brand';
import { heroGallery } from '@/config/showcase';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { buttonVariants } from '@/components/ui/button';

export function SeedanceHero() {
  const [prompt, setPrompt] = useState('');

  return (
    <section className="relative overflow-hidden px-4 pt-10 pb-16 sm:pt-16 sm:pb-24">
      {/* purple / blue glow blobs (matches seedance absolute blobs) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 size-80 rounded-full bg-[#a855f7] opacity-30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -bottom-40 size-80 rounded-full bg-[#3b82f6] opacity-25 blur-3xl"
      />

      <div className="relative mx-auto mb-8 max-w-4xl text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-200">
          <span className="animate-pulse text-purple-400">⚡</span>
          {m['landing.hero.banner']()}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[48px] lg:leading-[1.15]">
          <span className="text-purple-100">{m['landing.hero.line1']()}</span>
          <br />
          <span className="bg-gradient-to-r from-purple-200 via-fuchsia-200 to-blue-200 bg-clip-text text-transparent">
            {brand.name} {m['landing.hero.line2']()}
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-purple-200 sm:text-base lg:text-lg">
          {m['landing.hero.subheadline']()}
        </p>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-[0_0_60px_-20px_rgba(168,85,247,0.45)] backdrop-blur sm:p-5">
          <label className="sr-only" htmlFor="hero-prompt">
            Prompt
          </label>
          <textarea
            id="hero-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 3500))}
            rows={5}
            placeholder={m['landing.hero.prompt_placeholder']()}
            className="min-h-[140px] w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
            <div className="flex flex-wrap gap-2 text-xs text-white/50">
              {['1:1', '16:9', '9:16', '3:2', '4:3'].map((r, i) => (
                <span
                  key={r}
                  className={cn(
                    'rounded-md border px-2 py-1',
                    i === 0
                      ? 'border-purple-400/60 bg-purple-500/20 text-purple-100'
                      : 'border-white/10'
                  )}
                >
                  {r}
                </span>
              ))}
              <span className="self-center">{prompt.length}/3500</span>
            </div>
            <Link
              href={
                prompt.trim()
                  ? `/ai-image-generator?prompt=${encodeURIComponent(prompt.trim())}`
                  : '/ai-image-generator'
              }
              className={cn(
                buttonVariants({ size: 'sm' }),
                'gap-1.5 rounded-lg bg-[#a855f7] text-white hover:bg-[#9333ea]'
              )}
            >
              <Sparkles className="size-3.5" />
              {m['landing.hero.generate']()}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {heroGallery.map((item, i) => (
            <div
              key={item.id}
              className={cn(
                'overflow-hidden rounded-xl border border-white/10 bg-white/5',
                i === 0 && 'row-span-2'
              )}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="h-full w-full object-cover"
                loading={i < 2 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mt-8 flex max-w-6xl flex-wrap justify-center gap-3">
        <Link
          href="/ai-image-generator"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'rounded-xl bg-[#a855f7] px-6 text-white hover:bg-[#9333ea]'
          )}
        >
          {m['landing.hero.cta']()}
        </Link>
        <Link
          href="/text-to-video-ai"
          className={cn(
            buttonVariants({ size: 'lg', variant: 'outline' }),
            'rounded-xl border-white/20 bg-transparent px-6 text-white hover:bg-white/5'
          )}
        >
          {m['landing.hero.secondary']()}
        </Link>
      </div>
    </section>
  );
}
