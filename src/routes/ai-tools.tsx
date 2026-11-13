import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/ai-tools')(
  toolPageRouteOptions({
    title: 'AI Tools',
    subtitle: 'Explore more creative AI tools.',
    mode: 'image',
  })
);
