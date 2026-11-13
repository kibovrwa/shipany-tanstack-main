import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { WRAP_PNG_LIMITS } from '@/config/wrap';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';

export const Route = createFileRoute('/tesla-wrap-png-checker')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.footer.png_checker']({}, { locale }),
      description: m['wrap.home.req_intro']({}, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/tesla-wrap-png-checker',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: PngCheckerPage,
});

function PngCheckerPage() {
  const [result, setResult] = useState<string | null>(null);

  return (
    <PageShell>
      <PageIntro
        title={m['wrap.footer.png_checker']()}
        description={m['wrap.home.req_intro']()}
      />
      <section className="mx-auto max-w-xl space-y-4 px-4 pb-24">
        <input
          type="file"
          accept="image/png"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.type !== 'image/png') {
              setResult('Not a PNG file.');
              return;
            }
            const bitmap = await createImageBitmap(file);
            const { width, height } = bitmap;
            bitmap.close();
            const issues: string[] = [];
            if (
              width < WRAP_PNG_LIMITS.minSize ||
              height < WRAP_PNG_LIMITS.minSize ||
              width > WRAP_PNG_LIMITS.maxSize ||
              height > WRAP_PNG_LIMITS.maxSize
            ) {
              issues.push(
                `Size ${width}×${height} is outside ${WRAP_PNG_LIMITS.minSize}–${WRAP_PNG_LIMITS.maxSize}px.`
              );
            }
            if (file.size > WRAP_PNG_LIMITS.maxBytes) {
              issues.push(
                `File is ${(file.size / 1024).toFixed(0)} KB (limit 1024 KB).`
              );
            }
            if (file.name.length > WRAP_PNG_LIMITS.maxNameLength) {
              issues.push(
                `File name is longer than ${WRAP_PNG_LIMITS.maxNameLength} characters.`
              );
            }
            setResult(
              issues.length
                ? issues.join(' ')
                : `Looks good: ${width}×${height}, ${(file.size / 1024).toFixed(0)} KB.`
            );
          }}
          className="block w-full text-sm"
        />
        {result ? (
          <p className="rounded-lg border border-neutral-200 bg-white p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
            {result}
          </p>
        ) : null}
        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <li>
            <strong>{m['wrap.home.req_resolution_label']()}</strong>{' '}
            {m['wrap.home.req_resolution']()}
          </li>
          <li>
            <strong>{m['wrap.home.req_format_label']()}</strong>{' '}
            {m['wrap.home.req_format']()}
          </li>
          <li>
            <strong>{m['wrap.home.req_size_label']()}</strong>{' '}
            {m['wrap.home.req_size']()}
          </li>
          <li>
            <strong>{m['wrap.home.req_usb_label']()}</strong>{' '}
            {m['wrap.home.req_usb']()}
          </li>
        </ul>
        <p className="text-sm text-neutral-500">
          {m['wrap.home.req_footer']()}
        </p>
      </section>
    </PageShell>
  );
}
