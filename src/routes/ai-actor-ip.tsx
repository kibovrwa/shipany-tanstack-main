import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/ai-actor-ip')(
  toolPageRouteOptions({
    title: 'IP Actor',
    subtitle: 'Consistent character / IP actor generation.',
    mode: 'image',
  })
);
