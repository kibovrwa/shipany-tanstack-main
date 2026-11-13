import { createFileRoute } from '@tanstack/react-router';

import { brand } from '@/config/brand';
import { SeedanceFooter } from '@/blocks/seedance-footer';
import { SeedanceHeader } from '@/blocks/seedance-header';

function Page() {
  return (
    <div className="seedance-page min-h-screen bg-[#121317] text-[#fafafa]">
      <SeedanceHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-white">Community Hub</h1>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          Placeholder legal / info copy for {brand.name}. Replace before launch.
          Contact{' '}
          <a
            className="text-purple-300 underline"
            href={`mailto:${brand.contactEmail}`}
          >
            {brand.contactEmail}
          </a>
          .
        </p>
      </main>
      <SeedanceFooter />
    </div>
  );
}

export const Route = createFileRoute('/version-hub')({
  component: Page,
  head: () => ({ meta: [{ title: 'Community Hub | Seedance AI' }] }),
});
