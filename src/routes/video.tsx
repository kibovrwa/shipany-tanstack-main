import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { GeneratorShell } from '@/components/generator-shell';

const searchSchema = z.object({
  prompt: z.string().optional(),
  model: z.string().optional(),
});

function VideoPage() {
  const { prompt } = Route.useSearch();
  return (
    <GeneratorShell
      mode="video"
      title={m['generator.video.title']()}
      subtitle={m['generator.video.subtitle']()}
      initialPrompt={prompt ?? ''}
    />
  );
}

export const Route = createFileRoute('/video')({
  validateSearch: searchSchema,
  loader: () => {
    const locale = getLocale();
    return { title: m['generator.video.title']({}, { locale }) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : [],
  }),
  component: VideoPage,
});
