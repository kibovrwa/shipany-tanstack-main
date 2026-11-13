import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/ai-paint')(
  toolPageRouteOptions({
    title: 'AI Paint',
    subtitle: 'Paint and generate with AI.',
    mode: 'image',
  })
);
