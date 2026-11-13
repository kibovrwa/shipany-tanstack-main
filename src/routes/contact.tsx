import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';

import { envConfigs } from '@/config';
import { wrapPageHead } from '@/lib/wrap/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { PageIntro, PageShell } from '@/blocks/wrap/page-shell';

export const Route = createFileRoute('/contact')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['wrap.footer.contact']({}, { locale }),
      description: m['wrap.home.about_desc'](
        { brand: envConfigs.app_name },
        { locale }
      ),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? wrapPageHead({
          path: '/contact',
          locale: loaderData.locale,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <PageShell>
      <PageIntro
        title={m['wrap.footer.contact']()}
        description={m['wrap.footer.feedback']()}
      />
      <form
        className="mx-auto w-full max-w-xl space-y-4 px-4 pb-24"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success('Thanks — we received your message.');
          setName('');
          setEmail('');
          setMessage('');
        }}
      >
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-neutral-700 dark:text-neutral-300">
            Name
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-neutral-700 dark:text-neutral-300">
            Email
          </span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-neutral-700 dark:text-neutral-300">
            Message
          </span>
          <textarea
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
        >
          Send message
        </button>
      </form>
    </PageShell>
  );
}
