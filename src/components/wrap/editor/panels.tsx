import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  ImageUp,
  Loader2,
  Lock,
  LockOpen,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import type { WrapDesign } from '@/config/wrap-gallery';
import { cn } from '@/lib/utils';
import {
  addLayer,
  duplicateLayer,
  imageLayer,
  isFill,
  moveLayer,
  removeLayer,
  setBaseFill,
  updateLayer,
  type WrapLayer,
  type WrapPaint,
} from '@/lib/wrap/doc';
import { paintCss, thumbnail } from '@/lib/wrap/render';
import { drawSticker, STICKERS } from '@/lib/wrap/stickers';
import { designStore, type SavedDesign } from '@/lib/wrap/storage';

import type { EditorAi, EditorLabels } from './labels';
import type { WrapEditorApi } from './use-editor';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const UPLOAD_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const STICKER_COLORS = ['#facc15', '#38bdf8', '#f97316', '#f43f5e', '#a855f7', '#22c55e', '#ffffff', '#111111'];

export const GRADIENT_PRESETS: { colors: string[]; angle: number }[] = [
  { colors: ['#22d3ee', '#6366f1', '#d946ef'], angle: 90 },
  { colors: ['#f97316', '#ef4444', '#7c2d12'], angle: 90 },
  { colors: ['#fde047', '#f97316', '#db2777'], angle: 60 },
  { colors: ['#0ea5e9', '#1e3a8a'], angle: 90 },
  { colors: ['#34d399', '#065f46'], angle: 120 },
  { colors: ['#f0abfc', '#818cf8', '#22d3ee'], angle: 45 },
  { colors: ['#111827', '#6b7280', '#f9fafb'], angle: 90 },
  { colors: ['#be123c', '#111111'], angle: 90 },
];

const fieldClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-500';
const primaryButton =
  'inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white';
const ghostIcon =
  'flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-default disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white';
const sectionTitle =
  'mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400';

export function PanelFrame({
  title,
  icon,
  actions,
  closeLabel,
  onClose,
  children,
}: {
  title: string;
  icon: ReactNode;
  actions?: ReactNode;
  closeLabel: string;
  onClose(): void;
  children: ReactNode;
}) {
  return (
    <div className="flex max-h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
          {icon}
          {title}
        </h2>
        <div className="flex items-center gap-1">
          {actions}
          <button type="button" aria-label={closeLabel} title={closeLabel} onClick={onClose} className={cn(ghostIcon, 'md:hidden')}>
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}

interface PanelProps {
  editor: WrapEditorApi;
  labels: EditorLabels;
}

async function stickerBlob(kind: (typeof STICKERS)[number]['kind'], color: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 384;
  drawSticker(canvas.getContext('2d')!, kind, color, 192, 192, 310);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/png')
  );
}

function StickerButton({
  kind,
  color,
  label,
  onClick,
}: {
  kind: (typeof STICKERS)[number]['kind'];
  color: string;
  label: string;
  onClick(): void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext('2d')!;
    ctx.clearRect(0, 0, 64, 64);
    drawSticker(ctx, kind, color, 32, 32, 50);
  }, [kind, color]);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-500"
    >
      <canvas ref={ref} width={64} height={64} className="size-8" />
    </button>
  );
}

export function AssetsPanel({ editor, labels }: PanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [stickerColor, setStickerColor] = useState(STICKER_COLORS[0]);

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files).slice(0, 8);
    if (!list.length) return;
    setBusy(true);
    try {
      for (const file of list) {
        if (!UPLOAD_TYPES.includes(file.type) || file.size > MAX_UPLOAD_BYTES) {
          toast.error(labels.assets.invalid);
          continue;
        }
        const item = await editor.addImage(file, file.name.replace(/\.[^.]+$/, ''), 'upload');
        place(item.id, item.name, item);
      }
    } catch {
      toast.error(labels.assets.invalid);
    } finally {
      setBusy(false);
    }
  }

  function place(id: string, name: string, size: { width: number; height: number }) {
    const doc = editor.docRef.current;
    const layer = imageLayer(doc, name || labels.layers.name.image, id, size);
    editor.commit(addLayer(doc, layer));
    editor.setSelectedId(layer.id);
    editor.setTool('select');
  }

  const images = editor.library.filter((i) => !i.id.startsWith('sticker_'));

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-3 py-5 text-center transition-colors',
          over
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500'
        )}
      >
        {busy ? (
          <Loader2 className="size-5 animate-spin text-neutral-500" />
        ) : (
          <ImageUp className="size-5 text-neutral-500 dark:text-neutral-400" />
        )}
        <span className="text-sm font-medium text-neutral-900 dark:text-white">{labels.assets.upload}</span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{labels.assets.hint}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={UPLOAD_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <p className={cn(sectionTitle, 'mt-5')}>{labels.assets.stickers}</p>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {STICKER_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            onClick={() => setStickerColor(c)}
            className={cn(
              'size-5 cursor-pointer rounded-full border border-black/10 dark:border-white/20',
              stickerColor === c && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900'
            )}
            style={{ background: c }}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {STICKERS.map((s) => (
          <StickerButton
            key={s.kind}
            kind={s.kind}
            color={stickerColor}
            label={s.kind}
            onClick={async () => {
              const id = `sticker_${s.kind}_${stickerColor.slice(1)}`;
              const item = await editor.addImage(await stickerBlob(s.kind, stickerColor), s.kind, 'upload', id);
              place(item.id, s.kind, { width: item.width, height: item.height });
            }}
          />
        ))}
      </div>

      <p className={cn(sectionTitle, 'mt-5')}>{labels.assets.yours}</p>
      {images.length === 0 ? (
        <p className="text-xs text-neutral-500 dark:text-neutral-500">{labels.assets.empty}</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((item) => (
            <div key={item.id} className="group relative">
              <button
                type="button"
                title={item.name}
                onClick={async () => {
                  await editor.ensureAsset(item);
                  place(item.id, item.name, item);
                }}
                className="wrap-checker block aspect-square w-full cursor-pointer overflow-hidden rounded-lg border border-neutral-200 transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
              >
                <img src={item.url} alt={item.name} className="h-full w-full object-contain" />
              </button>
              <button
                type="button"
                aria-label={labels.assets.remove}
                title={labels.assets.remove}
                onClick={() => editor.removeFromLibrary(item.id)}
                className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function AiPanel({
  labels,
  ai,
  prompt,
  onPrompt,
  busy,
  onGenerate,
}: {
  labels: EditorLabels;
  ai: EditorAi;
  prompt: string;
  onPrompt(value: string): void;
  busy: boolean;
  onGenerate(): void;
}) {
  if (!ai.signedIn) {
    return (
      <div className="py-2 text-center">
        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">{labels.ai.signInPrompt}</p>
        <Link href={ai.signInHref} className={primaryButton}>
          {labels.ai.signIn}
        </Link>
      </div>
    );
  }
  const short = ai.credits !== null && ai.credits < ai.cost;
  return (
    <>
      <textarea
        value={prompt}
        onChange={(e) => onPrompt(e.target.value)}
        rows={4}
        maxLength={600}
        placeholder={labels.ai.placeholder}
        className={cn(fieldClass, 'resize-none')}
      />
      <p className={cn(sectionTitle, 'mt-3')}>{labels.ai.ideasTitle}</p>
      <div className="flex flex-wrap gap-1.5">
        {labels.ai.ideas.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => onPrompt(idea)}
            className="cursor-pointer rounded-full border border-neutral-200 px-2.5 py-1 text-left text-xs text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
          >
            {idea}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={busy || short}
        onClick={onGenerate}
        className="mt-4 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {busy ? labels.ai.generating : labels.ai.generate}
      </button>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span>{labels.ai.cost(ai.cost)}</span>
        {ai.credits !== null ? <span>{labels.ai.balance(ai.credits)}</span> : null}
      </div>
      {short ? (
        <Link
          href={ai.pricingHref}
          className="mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
        >
          {labels.ai.buy}
        </Link>
      ) : null}
    </>
  );
}

export function HistoryPanel({
  labels,
  ai,
  onUse,
}: {
  labels: EditorLabels;
  ai: EditorAi;
  onUse(item: EditorAi['history'][number]): Promise<void>;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  if (!ai.signedIn) {
    return (
      <div className="py-2 text-center">
        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">{labels.history.signInPrompt}</p>
        <Link href={ai.signInHref} className={primaryButton}>
          {labels.ai.signIn}
        </Link>
      </div>
    );
  }
  if (!ai.history.length) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">{labels.history.empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {ai.history.map((item) => {
        const usable = item.status === 'success' && !!item.imageUrl;
        return (
          <li key={item.id}>
            <button
              type="button"
              disabled={!usable || loading !== null}
              title={usable ? labels.history.use : undefined}
              onClick={async () => {
                setLoading(item.id);
                try {
                  await onUse(item);
                } finally {
                  setLoading(null);
                }
              }}
              className="flex w-full cursor-pointer items-start gap-2 rounded-lg border border-neutral-200 p-2 text-left transition-colors hover:border-neutral-400 disabled:cursor-default disabled:hover:border-neutral-200 dark:border-neutral-800 dark:hover:border-neutral-600 dark:disabled:hover:border-neutral-800"
            >
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-xs text-neutral-800 dark:text-neutral-200">{item.prompt}</span>
                <span
                  className={cn(
                    'mt-1 block text-[11px]',
                    item.status === 'failed' ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-500'
                  )}
                >
                  {item.status === 'success'
                    ? labels.history.use
                    : item.status === 'failed'
                      ? labels.history.failed
                      : labels.history.pending}
                </span>
              </span>
              {loading === item.id ? <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-neutral-500" /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function DesignsPanel({
  editor,
  labels,
  gallery,
  exportArt,
}: PanelProps & {
  gallery: Pick<WrapDesign, 'id' | 'title' | 'recipe'>[];
  exportArt(): HTMLCanvasElement | null;
}) {
  const [tab, setTab] = useState<'gallery' | 'mine'>('gallery');
  const [saved, setSaved] = useState<SavedDesign[]>([]);
  const [name, setName] = useState('');

  const refresh = () =>
    designStore
      .list()
      .then(setSaved)
      .catch(() => setSaved([]));

  useEffect(() => {
    void refresh();
  }, []);

  async function save() {
    const art = exportArt();
    const doc = editor.docRef.current;
    try {
      await designStore.put({
        id: `design_${Date.now().toString(36)}`,
        name: name.trim() || labels.designs.untitled,
        vehicle: doc.vehicle,
        doc,
        thumb: art ? thumbnail(art) : '',
        updatedAt: Date.now(),
      });
      setName('');
      toast.success(labels.top.saved);
      await refresh();
    } catch {
      toast.error(labels.notice.storage);
    }
  }

  return (
    <>
      <div className="mb-3 grid grid-cols-2 rounded-lg border border-neutral-200 p-0.5 text-xs font-medium dark:border-neutral-800">
        {(['gallery', 'mine'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'cursor-pointer rounded-md px-2 py-1.5 transition-colors',
              tab === t
                ? 'bg-neutral-900 text-white dark:bg-neutral-700'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            )}
          >
            {t === 'gallery' ? labels.designs.gallery : labels.designs.mine}
          </button>
        ))}
      </div>

      {tab === 'gallery' ? (
        <div className="grid grid-cols-2 gap-2">
          {gallery.map((design) => (
            <button
              key={design.id}
              type="button"
              title={design.title}
              onClick={() => {
                editor.commit((doc) =>
                  setBaseFill(doc, design.title, { kind: 'pattern', recipe: design.recipe })
                );
                toast.success(labels.designs.applied);
              }}
              className="group cursor-pointer overflow-hidden rounded-lg border border-neutral-200 text-left transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
            >
              <img
                src={`/wrap/gallery/${design.id}.webp`}
                alt={design.title}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />
              <span className="block truncate px-2 py-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                {design.title}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder={labels.designs.namePlaceholder}
              className={fieldClass}
            />
            <button
              type="button"
              onClick={save}
              aria-label={labels.designs.saveCurrent}
              title={labels.designs.saveCurrent}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-neutral-900 text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            >
              <Save className="size-4" />
            </button>
          </div>
          {saved.length === 0 ? (
            <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-500">{labels.designs.empty}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {saved.map((design) => (
                <li
                  key={design.id}
                  className="flex items-center gap-2 rounded-lg border border-neutral-200 p-1.5 dark:border-neutral-800"
                >
                  <button
                    type="button"
                    title={labels.designs.open}
                    onClick={() => editor.load(design.doc, { undoable: true })}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                  >
                    <span className="wrap-checker block size-10 shrink-0 overflow-hidden rounded-md">
                      {design.thumb ? <img src={design.thumb} alt="" className="h-full w-full object-cover" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-neutral-900 dark:text-white">
                        {design.name}
                      </span>
                      <span className="block truncate text-[11px] text-neutral-500">{design.vehicle}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={labels.designs.remove}
                    title={labels.designs.remove}
                    onClick={() => designStore.remove(design.id).then(refresh)}
                    className={ghostIcon}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

export function GradientPanel({
  editor,
  labels,
  initial,
}: PanelProps & { initial?: { colors: string[]; angle: number } }) {
  const [colors, setColors] = useState<string[]>(initial?.colors ?? GRADIENT_PRESETS[0].colors);
  const [angle, setAngle] = useState(initial?.angle ?? 90);
  const paint: WrapPaint =
    colors.length === 1 ? { kind: 'solid', color: colors[0] } : { kind: 'gradient', colors, angle };

  function apply(next: WrapPaint = paint) {
    editor.commit((doc) =>
      setBaseFill(doc, next.kind === 'solid' ? labels.layers.name.fill : labels.layers.name.gradient, next)
    );
  }

  return (
    <>
      <div className="mb-4 h-16 rounded-lg border border-neutral-200 dark:border-neutral-700" style={{ background: paintCss(paint) }} />
      <p className={sectionTitle}>{labels.gradient.colors}</p>
      <div className="flex flex-wrap items-center gap-2">
        {colors.map((color, i) => (
          <span key={i} className="relative">
            <input
              type="color"
              value={color}
              aria-label={`${labels.gradient.colors} ${i + 1}`}
              onChange={(e) => setColors(colors.map((c, j) => (j === i ? e.target.value : c)))}
              className="size-9 cursor-pointer rounded-lg border border-neutral-200 bg-transparent p-0.5 dark:border-neutral-700"
            />
            {colors.length > 1 ? (
              <button
                type="button"
                aria-label={labels.gradient.removeStop}
                onClick={() => setColors(colors.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 flex size-4 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-neutral-200 dark:text-neutral-900"
              >
                <X className="size-2.5" />
              </button>
            ) : null}
          </span>
        ))}
        {colors.length < 4 ? (
          <button
            type="button"
            aria-label={labels.gradient.addStop}
            title={labels.gradient.addStop}
            onClick={() => setColors([...colors, '#ffffff'])}
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-300 text-neutral-500 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
          >
            <Plus className="size-4" />
          </button>
        ) : null}
      </div>

      <label className="mt-4 block">
        <span className={cn(sectionTitle, 'flex items-center justify-between')}>
          {labels.gradient.angle}
          <span className="tabular-nums">{angle}°</span>
        </span>
        <input
          type="range"
          min={0}
          max={360}
          step={5}
          value={angle}
          disabled={colors.length === 1}
          onChange={(e) => setAngle(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </label>

      <button type="button" onClick={() => apply()} className={cn(primaryButton, 'mt-4')}>
        {labels.gradient.apply}
      </button>

      <p className={cn(sectionTitle, 'mt-5')}>{labels.gradient.presets}</p>
      <div className="grid grid-cols-4 gap-2">
        {GRADIENT_PRESETS.map((preset, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${labels.gradient.presets} ${i + 1}`}
            onClick={() => {
              setColors(preset.colors);
              setAngle(preset.angle);
              apply({ kind: 'gradient', ...preset });
            }}
            className="aspect-square cursor-pointer rounded-lg border border-neutral-200 transition-transform hover:scale-105 dark:border-neutral-700"
            style={{ background: paintCss({ kind: 'gradient', ...preset }) }}
          />
        ))}
      </div>
    </>
  );
}

export function PlatesPanel({ labels }: { labels: EditorLabels }) {
  const [text, setText] = useState('');
  return (
    <>
      <p className="mb-4 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        {labels.plates.description}
      </p>
      <label className="block">
        <span className={sectionTitle}>{labels.plates.text}</span>
        <input
          value={text}
          maxLength={8}
          onChange={(e) => setText(e.target.value.toUpperCase())}
          className={cn(fieldClass, 'font-mono tracking-widest uppercase')}
        />
      </label>
      <Link
        href={`/plate/generate${text ? `?text=${encodeURIComponent(text)}` : ''}`}
        className={cn(primaryButton, 'mt-3')}
      >
        {labels.plates.open}
      </Link>
      <Link
        href="/plate"
        className="mt-2 inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
      >
        {labels.plates.browse}
      </Link>
    </>
  );
}

function layerSwatch(layer: WrapLayer): string {
  if (layer.type === 'fill') return paintCss(layer.paint);
  if (layer.type === 'text' || layer.type === 'path') return layer.color;
  if (layer.type === 'rect' || layer.type === 'ellipse') return layer.fill;
  return 'transparent';
}

export function LayersPanel({ editor, labels }: PanelProps) {
  const { doc, selectedId } = editor;
  if (!doc.layers.length) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">{labels.layers.empty}</p>;
  }
  const ordered = doc.layers.slice().reverse();
  return (
    <ul className="space-y-1">
      {ordered.map((layer, index) => {
        const active = layer.id === selectedId;
        const thumb = layer.type === 'image' ? editor.library.find((i) => i.id === layer.assetId)?.url : undefined;
        return (
          <li
            key={layer.id}
            className={cn(
              'rounded-lg border transition-colors',
              active
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
          >
            <div className="flex items-center gap-1.5 p-1.5">
              <button
                type="button"
                onClick={() => editor.setSelectedId(active ? null : layer.id)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
              >
                <span
                  className="wrap-checker block size-7 shrink-0 overflow-hidden rounded-md border border-black/10 dark:border-white/10"
                  style={thumb ? undefined : { background: layerSwatch(layer) }}
                >
                  {thumb ? <img src={thumb} alt="" className="h-full w-full object-contain" /> : null}
                </span>
                <span
                  className={cn(
                    'truncate text-xs',
                    layer.visible ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 line-through dark:text-neutral-600'
                  )}
                >
                  {layer.type === 'text' ? layer.text.split('\n')[0] || layer.name : layer.name}
                </span>
              </button>
              <button
                type="button"
                aria-label={layer.visible ? labels.layers.hide : labels.layers.show}
                title={layer.visible ? labels.layers.hide : labels.layers.show}
                onClick={() => editor.commit((d) => updateLayer(d, layer.id, { visible: !layer.visible }))}
                className={ghostIcon}
              >
                {layer.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              </button>
              <button
                type="button"
                aria-label={layer.locked ? labels.layers.unlock : labels.layers.lock}
                title={layer.locked ? labels.layers.unlock : labels.layers.lock}
                onClick={() => editor.commit((d) => updateLayer(d, layer.id, { locked: !layer.locked }))}
                className={ghostIcon}
              >
                {layer.locked ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
              </button>
            </div>
            {active ? (
              <div className="flex items-center justify-end gap-0.5 px-1.5 pb-1.5">
                <button
                  type="button"
                  aria-label={labels.layers.up}
                  title={labels.layers.up}
                  disabled={index === 0}
                  onClick={() => editor.commit((d) => moveLayer(d, layer.id, 1))}
                  className={ghostIcon}
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={labels.layers.down}
                  title={labels.layers.down}
                  disabled={index === ordered.length - 1}
                  onClick={() => editor.commit((d) => moveLayer(d, layer.id, -1))}
                  className={ghostIcon}
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={labels.layers.duplicate}
                  title={labels.layers.duplicate}
                  onClick={() => {
                    const [next, id] = duplicateLayer(editor.docRef.current, layer.id);
                    editor.commit(next);
                    if (!isFill(layer)) editor.setSelectedId(id);
                  }}
                  className={ghostIcon}
                >
                  <Copy className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={labels.layers.remove}
                  title={labels.layers.remove}
                  onClick={() => {
                    editor.commit((d) => removeLayer(d, layer.id));
                    editor.setSelectedId(null);
                  }}
                  className={cn(ghostIcon, 'hover:text-red-500 dark:hover:text-red-400')}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}