import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/ai-hairstyle-changer')(
  toolPageRouteOptions({
    title: 'Hairstyle Changer',
    subtitle: 'Try new hairstyles with AI.',
    mode: 'image',
  })
);
