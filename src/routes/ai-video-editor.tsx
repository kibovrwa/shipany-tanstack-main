import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/ai-video-editor')(
  toolPageRouteOptions({
    title: 'AI Video Editor',
    subtitle: 'Edit and restyle AI videos.',
    mode: 'video',
  })
);
