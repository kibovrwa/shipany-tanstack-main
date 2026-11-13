import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/ai-image-editor')(
  toolPageRouteOptions({
    title: 'AI Image Editor',
    subtitle: 'Edit images with AI.',
    mode: 'image',
  })
);
