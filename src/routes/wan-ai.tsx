import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/wan-ai')(
  toolPageRouteOptions({
    title: 'Wan AI',
    subtitle: 'Fast generation, low latency preview.',
    mode: 'video',
  })
);
