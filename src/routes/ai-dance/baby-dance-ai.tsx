import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from '../-tool-page';

export const Route = createFileRoute('/ai-dance/baby-dance-ai')(
  toolPageRouteOptions({
    title: 'AI Baby Dance',
    subtitle: 'Turn stills into dance clips.',
    mode: 'video',
  })
);
