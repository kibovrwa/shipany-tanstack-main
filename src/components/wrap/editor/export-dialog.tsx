import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { WRAP_PNG_LIMITS, type WrapVehicle } from '@/config/wrap';
import { cn } from '@/lib/utils';
import {
  downloadBlob,
  exportWrapPng,
  sanitizeWrapName,
} from '@/lib/wrap/export';
import { composeExport, type WrapTemplate } from '@/lib/wrap/render';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { EditorLabels } from './labels';

const SIZES = [1024, 768, 512];

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function ExportDialog({
  mode,
  onClose,
  labels,
  vehicle,
  template,
  contactHref,
  getArt,
}: {
  mode: false | 'export' | 'share';
  onClose(): void;
  labels: EditorLabels;
  vehicle: WrapVehicle;
  template: WrapTemplate | null;
  contactHref: string;
  getArt(): HTMLCanvasElement | null;
}) {
  const [name, setName] = useState('');
  const [size, setSize] = useState(SIZES[0]);
  const [clip, setClip] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    text: string;
    reduced: boolean;
  } | null>(null);
  // Kept while the dialog closes so its text does not swap mid-animation.
  const [shown, setShown] = useState<'export' | 'share'>('export');

  useEffect(() => {
    if (mode) {
      setShown(mode);
      setResult(null);
    }
  }, [mode]);

  async function download() {
    const art = getArt();
    if (!art) return;
    setBusy(true);
    try {
      const out = await exportWrapPng(composeExport(art, template, clip), size);
      downloadBlob(out.blob, `${sanitizeWrapName(name || vehicle.slug)}.png`);
      setResult({
        text: labels.exporter.result(
          formatBytes(out.blob.size),
          `${out.width} × ${out.height}`
        ),
        reduced: out.reduced || out.width < size,
      });
    } finally {
      setBusy(false);
    }
  }

  const field =
    'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-500';

  return (
    <Dialog open={!!mode} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {shown === 'share'
              ? labels.exporter.shareTitle
              : labels.exporter.title}
          </DialogTitle>
          <DialogDescription>
            {shown === 'share'
              ? labels.exporter.shareNote
              : labels.exporter.description}
          </DialogDescription>
        </DialogHeader>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {labels.exporter.fileName}
          </span>
          <input
            value={name}
            maxLength={WRAP_PNG_LIMITS.maxNameLength}
            placeholder={vehicle.slug}
            onChange={(e) =>
              setName(e.target.value.replace(/[^A-Za-z0-9 _-]/g, ''))
            }
            className={field}
          />
          <span className="mt-1 block text-[11px] text-neutral-500">
            {labels.exporter.fileNameHint}
          </span>
        </label>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {labels.exporter.size}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                onClick={() => setSize(s)}
                className={cn(
                  'cursor-pointer rounded-lg border px-2 py-2 text-sm font-medium tabular-nums transition-colors',
                  size === s
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500'
                )}
              >
                {s} px
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={clip}
            onChange={(e) => setClip(e.target.checked)}
            className="mt-0.5 size-4 accent-blue-500"
          />
          <span>
            <span className="block text-sm font-medium text-neutral-900 dark:text-white">
              {labels.exporter.clip}
            </span>
            <span className="block text-xs text-neutral-500 dark:text-neutral-400">
              {labels.exporter.clipHint}
            </span>
          </span>
        </label>

        <button
          type="button"
          disabled={busy}
          onClick={download}
          className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {busy ? labels.exporter.working : labels.exporter.download}
        </button>

        {result ? (
          <p className="text-xs text-neutral-600 dark:text-neutral-300">
            {result.text}
            {result.reduced ? ` ${labels.exporter.reduced}` : ''}
          </p>
        ) : null}

        {shown === 'share' ? (
          <Link
            href={contactHref}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
          >
            {labels.exporter.shareCta}
          </Link>
        ) : (
          <div className="rounded-lg bg-neutral-100 p-3 text-xs leading-relaxed text-neutral-600 dark:bg-neutral-800/70 dark:text-neutral-300">
            <p className="mb-1 font-semibold text-neutral-900 dark:text-white">
              {labels.exporter.howTo}
            </p>
            <p>{labels.exporter.viaUsb}</p>
            <p className="mt-1">{labels.exporter.viaApp}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}