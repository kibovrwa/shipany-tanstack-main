import { createFileRoute } from '@tanstack/react-router';

import { toolPageRouteOptions } from './-tool-page';

export const Route = createFileRoute('/ai-pose')(
  toolPageRouteOptions({
    title: 'AI Pose Changer',
    subtitle: 'Change subject pose with AI.',
    mode: 'image',
  })
);
