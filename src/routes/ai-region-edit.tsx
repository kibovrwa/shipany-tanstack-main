import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/ai-region-edit')(
  toolPageRouteOptions({
    title: 'AI Region Edit',
    subtitle: 'Inpaint and region edit.',
    mode: 'image',
  })
);
