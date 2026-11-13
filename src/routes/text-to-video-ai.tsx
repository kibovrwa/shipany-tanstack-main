import { createFileRoute } from '@tanstack/react-router';

import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { GeneratorShell } from '@/components/generator-shell';

function TextToVideoPage() {
  return (
    <GeneratorShell
      mode="video"
      title={m['generator.video.title']()}
      subtitle={m['generator.video.subtitle']()}
    />
  );
}

export const Route = createFileRoute('/text-to-video-ai')({
  loader: () => {
    const locale = getLocale();
    return { title: m['generator.video.title']({}, { locale }) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : [],
  }),
  component: TextToVideoPage,
});
