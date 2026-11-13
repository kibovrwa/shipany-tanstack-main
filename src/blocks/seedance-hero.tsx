import { useState } from 'react';
import { ImageIcon, Sparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { brand } from '@/config/brand';
import { heroModels } from '@/config/showcase';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';

export function SeedanceHero() {
  const [prompt, setPrompt] = useState(m['landing.hero.sample_prompt']());
  const [model, setModel] = useState(heroModels[0] ?? 'Seedance');

  return (
    <section className="relative isolate overflow-hidden px-4 pt-10 pb-16 sm:pt-14 sm:pb-20">
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/showcase/seevideo/hero-bg.png')",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#121317]/55 via-[#121317]/75 to-[#121317]"
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.15]">
          {m['landing.hero.line1']()}{' '}
          <span className="text-[#F2CE5A]">{m['landing.hero.line2']()}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm text-[#F2CE5A]/90 sm:text-base lg:text-lg">
          {m['landing.hero.subheadline']()}
        </p>

        <div className="hero-border-beam relative mx-auto mt-8 max-w-3xl rounded-full bg-[rgba(77,77,86,0.35)] p-[1px] shadow-[0_0_40px_-10px_rgba(242,206,90,0.35)]">
          <div className="hero-border-beam-inner flex items-center gap-2 rounded-full bg-[rgba(18,18,18,0.72)] px-3 py-2 sm:px-4">
            <ImageIcon className="hidden size-5 shrink-0 text-white/60 sm:block" />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 3500))}
              className="min-w-0 flex-1 bg-transparent text-left text-sm text-white outline-none placeholder:text-white/40"
              placeholder={m['landing.hero.prompt_placeholder']()}
              aria-label="Prompt"
            />
            <Link
              href={
                prompt.trim()
                  ? `/video?prompt=${encodeURIComponent(prompt.trim())}&model=${encodeURIComponent(model)}`
                  : '/video'
              }
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#F2CE5A] px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#e6c04a]"
            >
              <Sparkles className="size-3.5" />
              {m['landing.hero.generate']()}
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-2 rounded-full bg-black/10 px-3 py-2">
          {heroModels.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setModel(name)}
              className={cn(
                'rounded-full px-3 py-1 text-xs transition',
                model === name
                  ? 'bg-white/15 text-[#F2CE5A]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              {name}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-white/45">
          {brand.name} · {model}
        </p>
      </div>
    </section>
  );
}
