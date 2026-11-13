import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { GeneratorShell } from '@/components/generator-shell';

const searchSchema = z.object({
  prompt: z.string().optional(),
});

function AiImageGeneratorPage() {
  const { prompt } = Route.useSearch();
  return (
    <GeneratorShell
      mode="image"
      title={m['generator.image.title']()}
      subtitle={m['generator.image.subtitle']()}
      initialPrompt={prompt ?? ''}
    />
  );
}

export const Route = createFileRoute('/ai-image-generator')({
  validateSearch: searchSchema,
  loader: () => {
    const locale = getLocale();
    return { title: m['generator.image.title']({}, { locale }) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : [],
  }),
  component: AiImageGeneratorPage,
});
