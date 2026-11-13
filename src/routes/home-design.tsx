import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/home-design')(
  toolPageRouteOptions({
    title: 'Home Design',
    subtitle: 'AI interior and home design generator.',
    mode: 'image',
  })
);
