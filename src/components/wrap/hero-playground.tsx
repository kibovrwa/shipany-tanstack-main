import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, ImageUp, Plus, RotateCcw, WandSparkles, X } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import type { WrapVehicle } from '@/config/wrap';
import { cn } from '@/lib/utils';
import { downloadCanvasPng } from '@/lib/wrap/export';
import { drawPattern, type PatternRecipe } from '@/lib/wrap/patterns';
import { drawSticker, STICKERS, type StickerKind } from '@/lib/wrap/stickers';
import { zoneAnchor } from '@/lib/wrap/zones';

import { CarPreview, type CarPreviewHandle } from './car-preview';

export interface HeroWrapOption {
  id: string;
  title: string;
  thumb: string;
  /** Omitted for the bare factory paint. */
  recipe?: PatternRecipe;
}

export interface HeroPlaygroundLabels {
  preview: string;
  tryWrap: string;
  trySticker: string;
  sticker: (name: StickerKind) => string;
  upload: string;
  aiDesign: string;
  download: string;
  reset: string;
  hideTools: string;
}

export interface HeroPlaygroundProps {
  vehicle: WrapVehicle;
  options: HeroWrapOption[];
  poster: string;
  editorHref: string;
  downloadName: string;
  labels: HeroPlaygroundLabels;
}

const BASE_PAINT = '#f1f1f2';

export function HeroPlayground({
  vehicle,
  options,
  poster,
  editorHref,
  downloadName,
  labels,
}: HeroPlaygroundProps) {
  const previewRef = useRef<CarPreviewHandle>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [selected, setSelected] = useState(options[0]?.id);
  const [sticker, setSticker] = useState<{
    kind: StickerKind;
    color: string;
  } | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    const el = document.createElement('canvas');
    el.width = vehicle.width;
    el.height = vehicle.height;
    setCanvas(el);
  }, [vehicle.width, vehicle.height]);

  const paint = useCallback(() => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    const option = options.find((o) => o.id === selected);
    if (option?.recipe) {
      drawPattern(ctx, width, height, option.recipe);
    } else {
      ctx.fillStyle = BASE_PAINT;
      ctx.fillRect(0, 0, width, height);
    }
    for (const zone of ['hood', 'sideA', 'sideB'] as const) {
      const a = zoneAnchor(vehicle, zone);
      const size = a.size * (zone === 'hood' ? 0.62 : 0.9);
      if (image) {
        const ratio = image.naturalWidth / image.naturalHeight || 1;
        const w = ratio >= 1 ? size : size * ratio;
        const h = ratio >= 1 ? size / ratio : size;
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.drawImage(image, -w / 2, -h / 2, w, h);
        ctx.restore();
      } else if (sticker) {
        drawSticker(ctx, sticker.kind, sticker.color, a.x, a.y, size, a.rotation);
      }
    }
    previewRef.current?.refresh();
  }, [canvas, image, options, selected, sticker, vehicle]);

  useEffect(paint, [paint]);

  function onFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSticker(null);
      setImage(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  const dirty = !!sticker || !!image || selected !== options[0]?.id;

  return (
    <div
      className="group/hero relative aspect-square w-full"
      onPointerDown={() => setSpinning(false)}
    >
      <div className="absolute inset-0 [filter:saturate(1.15)]">
        <CarPreview
          ref={previewRef}
          vehicle={vehicle}
          wrap={canvas}
          paint={BASE_PAINT}
          autoRotate={spinning}
          azimuth={38}
          elevation={13}
          distance={1.02}
          poster={poster}
          label={labels.preview}
          onReady={paint}
        />
      </div>

      <div className="absolute inset-x-0 top-1 z-10 flex justify-center px-4 md:top-[22%]">
        <div
          role="group"
          aria-label={labels.tryWrap}
          className="scrollbar-hide flex max-w-full gap-2 overflow-x-auto px-1 py-1"
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              title={option.title}
              onClick={() => setSelected(option.id)}
              className={cn(
                'relative h-12 w-[72px] shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-white/85 p-0.5 backdrop-blur transition-colors focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:outline-none md:h-14 md:w-[84px] dark:bg-neutral-900/85',
                option.id === selected
                  ? 'border-neutral-900 dark:border-white'
                  : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600'
              )}
            >
              <img
                src={option.thumb}
                alt=""
                width={84}
                height={56}
                className="h-full w-full scale-125 rounded-md object-cover"
              />
              <span className="sr-only">{option.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[12%] z-10 flex justify-center px-4 md:bottom-[16%]">
        <button
          type="button"
          aria-expanded={toolsOpen}
          onClick={() => setToolsOpen(true)}
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 bg-white/90 px-3 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-200',
            toolsOpen && 'hidden'
          )}
        >
          <Plus className="size-3.5" />
          <span>{labels.trySticker}</span>
        </button>

        <div
          role="group"
          aria-label={labels.trySticker}
          className={cn(
            'items-center gap-1 rounded-full border border-neutral-200 bg-white/90 p-1 shadow-lg backdrop-blur transition-opacity duration-200 dark:border-neutral-800 dark:bg-neutral-900/90',
            toolsOpen ? 'flex' : 'hidden md:flex',
            'md:opacity-0 md:group-focus-within/hero:opacity-100 md:group-hover/hero:opacity-100'
          )}
        >
          {STICKERS.map((s) => (
            <button
              key={s.kind}
              type="button"
              title={labels.sticker(s.kind)}
              aria-label={labels.sticker(s.kind)}
              aria-pressed={sticker?.kind === s.kind && !image}
              onClick={() => {
                setImage(null);
                setSticker((cur) => (cur?.kind === s.kind ? null : s));
              }}
              className={cn(
                'flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800',
                sticker?.kind === s.kind &&
                  !image &&
                  'bg-neutral-100 dark:bg-neutral-800'
              )}
            >
              <StickerIcon kind={s.kind} color={s.color} />
            </button>
          ))}
          <button
            type="button"
            title={labels.upload}
            aria-label={labels.upload}
            onClick={() => fileRef.current?.click()}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <ImageUp className="size-4" />
          </button>
          <span className="mx-0.5 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
          <Link
            href={editorHref}
            aria-label={labels.aiDesign}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-3 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:from-purple-600 hover:to-blue-600"
          >
            <WandSparkles className="size-3.5" />
            <span>{labels.aiDesign}</span>
          </Link>
          <button
            type="button"
            title={labels.download}
            aria-label={labels.download}
            onClick={() => canvas && downloadCanvasPng(canvas, downloadName)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <Download className="size-4" />
          </button>
          {dirty ? (
            <button
              type="button"
              title={labels.reset}
              aria-label={labels.reset}
              onClick={() => {
                setSticker(null);
                setImage(null);
                setSelected(options[0]?.id);
                previewRef.current?.resetView();
              }}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <RotateCcw className="size-4" />
            </button>
          ) : null}
          <button
            type="button"
            aria-label={labels.hideTools}
            onClick={() => setToolsOpen(false)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 md:hidden dark:hover:bg-neutral-800"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function StickerIcon({ kind, color }: { kind: StickerKind; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext('2d')!;
    ctx.clearRect(0, 0, el.width, el.height);
    drawSticker(ctx, kind, color, 28, 28, 44);
  }, [kind, color]);
  return <canvas ref={ref} width={56} height={56} className="size-7" />;
}