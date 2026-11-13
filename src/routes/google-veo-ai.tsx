import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/google-veo-ai')(
  toolPageRouteOptions({
    title: 'Google Veo AI',
    subtitle: 'Cinematic quality, long-form scenes.',
    mode: 'video',
  })
);
