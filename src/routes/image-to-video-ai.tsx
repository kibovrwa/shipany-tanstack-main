import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/image-to-video-ai')(
  toolPageRouteOptions({
    title: 'Image to Video AI',
    subtitle: 'Turn a still image into video.',
    mode: 'video',
  })
);
