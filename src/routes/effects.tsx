import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/effects')(
  toolPageRouteOptions({
    title: 'AI Video Effects',
    subtitle: 'Apply cinematic effects to clips.',
    mode: 'video',
  })
);
