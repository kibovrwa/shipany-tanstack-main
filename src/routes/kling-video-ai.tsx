import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/kling-video-ai')(
  toolPageRouteOptions({
    title: 'Kling AI',
    subtitle: 'High motion, fluid character movement.',
    mode: 'video',
  })
);
