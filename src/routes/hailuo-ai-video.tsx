import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/hailuo-ai-video')(
  toolPageRouteOptions({
    title: 'Minimax H3',
    subtitle: 'Advanced multimodal video generation.',
    mode: 'video',
  })
);
