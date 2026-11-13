import { useMemo, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { getPlateDesign, PLATE_DESIGNS } from '@/lib/wrap/plates';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';

export const Route = createFileRoute('/plate/generate')({
  validateSearch: (search: Record<string, unknown>) => ({
    text: typeof search.text === 'string' ? search.text : undefined,
    preset: typeof search.preset === 'string' ? search.preset : undefined,
  }),
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.footer.plate_generator']({}, { locale }),
      description: m['wrap.editor.plates_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/plate/generate',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: PlateGeneratorPage,
});

function PlateGeneratorPage() {
  const search = Route.useSearch();
  const preset = search.preset
    ? getPlateDesign(search.preset)
    : PLATE_DESIGNS[0];
  const [text, setText] = useState((search.text || 'WRAP').slice(0, 8));
  const [bg, setBg] = useState(preset?.cover ?? PLATE_DESIGNS[0].cover);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const previewStyle = useMemo(() => ({ backgroundImage: `url(${bg})` }), [bg]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 1024;
      canvas.height = 512;
      ctx.drawImage(img, 0, 0, 1024, 512);
      ctx.fillStyle = '#111827';
      ctx.font = '700 120px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.toUpperCase().slice(0, 8) || 'WRAP', 512, 280);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plate-${text.toLowerCase() || 'wrap'}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = bg;
  }

  return (
    <PageShell>
      <PageIntro
        title={m['wrap.footer.plate_generator']()}
        description={m['wrap.editor.plates_description']()}
      />
      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 pb-24 md:grid-cols-[1.2fr_0.8fr]">
        <div
          className="relative aspect-[2/1] overflow-hidden rounded-2xl border border-neutral-200 bg-cover bg-center dark:border-neutral-800"
          style={previewStyle}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-4xl font-bold tracking-[0.2em] text-neutral-900 uppercase sm:text-6xl">
              {text || 'WRAP'}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">
              {m['wrap.editor.plates_text']()}
            </span>
            <input
              value={text}
              maxLength={8}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono tracking-widest uppercase outline-none dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <div>
            <p className="mb-2 text-sm font-medium">Background</p>
            <div className="grid grid-cols-2 gap-2">
              {PLATE_DESIGNS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setBg(p.cover)}
                  className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="aspect-[2/1] w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={download}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            Download PNG
          </button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </section>
    </PageShell>
  );
}
