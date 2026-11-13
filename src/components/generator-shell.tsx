import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { modelCatalog } from '@/config/showcase';
import { apiPost } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { SeedanceFooter } from '@/blocks/seedance-footer';
import { SeedanceHeader } from '@/blocks/seedance-header';
import { buttonVariants } from '@/components/ui/button';

export type GeneratorMode = 'image' | 'video';

type GenerateResponse = {
  taskId: string;
  status: string;
  missingProvider?: boolean;
  message?: string;
};

export function GeneratorShell({
  mode,
  title,
  subtitle,
  initialPrompt = '',
}: {
  mode: GeneratorMode;
  title: string;
  subtitle: string;
  initialPrompt?: string;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const models = modelCatalog.filter((m) =>
    mode === 'video' ? m.kind !== 'image' : m.kind !== 'video'
  );
  const [selectedModel, setSelectedModel] = useState(
    () => models[0]?.id ?? 'default'
  );
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [missingKey, setMissingKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (vars: {
      prompt: string;
      mode: GeneratorMode;
      model?: string;
    }) => apiPost<GenerateResponse>('/api/ai/generate', vars),
    onSuccess: (data) => {
      if (data.missingProvider) {
        setMissingKey(true);
        setStatusMessage(data.message || m['generator.missing_provider']());
        setResultUrl(null);
        return;
      }
      setMissingKey(false);
      setStatusMessage(data.message || m['generator.submitted']());
      toast.success(m['generator.submitted']());
    },
    onError: (e: Error) => {
      setResultUrl(null);
      // Never fake success — surface the real error.
      toast.error(e.message || m['generator.failed']());
      setStatusMessage(e.message || m['generator.failed']());
    },
  });

  function onGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed) {
      toast.error(m['generator.prompt_required']());
      return;
    }
    mutation.mutate({ prompt: trimmed, mode, model: selectedModel });
  }

  return (
    <div className="seevideo-page min-h-screen bg-[#121317] text-white">
      <SeedanceHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-white lg:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-white/60 sm:text-base">{subtitle}</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(models.length
            ? models
            : [
                {
                  id: 'default',
                  name: mode === 'video' ? 'Video model' : 'Image model',
                },
              ]
          )
            .slice(0, 8)
            .map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => setSelectedModel(model.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors',
                  selectedModel === model.id
                    ? 'border-[#F2CE5A] bg-[#F2CE5A]/15 text-[#F2CE5A]'
                    : 'border-white/15 text-white/70 hover:border-white/30 hover:text-white'
                )}
              >
                {model.name}
              </button>
            ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 3500))}
              rows={8}
              placeholder={m['generator.prompt_placeholder']()}
              className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <span className="text-xs text-white/45">
                {prompt.length}/3500 · {mode === 'video' ? '16:9' : '1:1'}
              </span>
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={onGenerate}
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'gap-1.5 rounded-full bg-[#F2CE5A] font-semibold text-[#1a1a1a] hover:bg-[#e6c04a]'
                )}
              >
                {mutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {mode === 'video'
                  ? m['generator.generate_video']()
                  : m['generator.generate_image']()}
              </button>
            </div>
          </div>

          <div className="flex min-h-[280px] flex-col rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5">
            {missingKey && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">
                    {m['generator.missing_provider']()}
                  </p>
                  <p className="mt-1 text-amber-100/80">
                    {m['generator.missing_provider_hint']()}
                  </p>
                  <Link
                    href="/admin/settings"
                    className="mt-2 inline-block text-amber-200 underline underline-offset-2"
                  >
                    {m['generator.open_settings']()}
                  </Link>
                </div>
              </div>
            )}

            {resultUrl ? (
              mode === 'video' ? (
                <video
                  src={resultUrl}
                  controls
                  className="max-h-[420px] w-full rounded-xl object-contain"
                />
              ) : (
                <img
                  src={resultUrl}
                  alt="Generated"
                  className="max-h-[420px] w-full rounded-xl object-contain"
                />
              )
            ) : (
              <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center text-center text-sm">
                <p className="font-medium text-white/70">
                  {m['generator.empty_title']()}
                </p>
                <p className="mt-2 max-w-sm">{m['generator.empty_body']()}</p>
                {statusMessage && (
                  <p className="mt-4 text-xs text-purple-200/80">
                    {statusMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <SeedanceFooter />
    </div>
  );
}
