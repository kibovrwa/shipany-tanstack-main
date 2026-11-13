import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { isNoindexEnabled } from '@/config/brand';

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () => {
        const noindex = isNoindexEnabled();
        const body = noindex
          ? [
              'User-Agent: *',
              'Disallow: /',
              '',
              '# Preview / pre-launch: set VITE_NOINDEX=false to allow indexing',
              '',
            ].join('\n')
          : [
              'User-Agent: *',
              'Allow: /',
              'Disallow: /admin',
              'Disallow: /settings',
              'Disallow: /api/',
              'Disallow: /*?*',
              '',
              `Sitemap: ${envConfigs.app_url}/sitemap.xml`,
              '',
            ].join('\n');
        return new Response(body, {
          headers: { 'Content-Type': 'text/plain' },
        });
      },
    },
  },
});
