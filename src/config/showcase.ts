/**
 * Local showcase + model marketplace data for the SeeVideo-style SaaS.
 * Swap files under public/showcase/ without touching component code.
 */

export const modelCatalog = [
  {
    id: 'seedance',
    name: 'Seedance',
    blurb: 'Multi-scene AI video with audio input',
    href: '/video',
    kind: 'video' as const,
  },
  {
    id: 'seedream',
    name: 'Seedream',
    blurb: 'Studio-grade AI image creator',
    href: '/ai-image-generator',
    kind: 'image' as const,
  },
  {
    id: 'veo',
    name: 'Veo',
    blurb: 'Cinematic long-form scenes',
    href: '/google-veo-ai',
    kind: 'video' as const,
  },
  {
    id: 'wan',
    name: 'Wan',
    blurb: 'Fast generation, low latency',
    href: '/wan-ai',
    kind: 'video' as const,
  },
  {
    id: 'grok',
    name: 'Grok',
    blurb: 'Creative video experiments',
    href: '/video',
    kind: 'video' as const,
  },
  {
    id: 'kling',
    name: 'Kling',
    blurb: 'High motion character movement',
    href: '/kling-video-ai',
    kind: 'video' as const,
  },
  {
    id: 'nano-banana',
    name: 'Nano Banana',
    blurb: 'Fast stylized image generation',
    href: '/ai-image-generator',
    kind: 'image' as const,
  },
  {
    id: 'flux',
    name: 'Flux',
    blurb: 'High-fidelity text-to-image',
    href: '/ai-image-generator',
    kind: 'image' as const,
  },
] as const;

export const heroModels = modelCatalog.map((m) => m.name);

export const promptGallery = [
  {
    id: '1',
    src: '/showcase/seevideo/prompt-1.png',
    alt: 'AI video prompt example 1',
  },
  {
    id: '2',
    src: '/showcase/seevideo/prompt-2.png',
    alt: 'AI video prompt example 2',
  },
  {
    id: '3',
    src: '/showcase/seevideo/prompt-3.png',
    alt: 'AI video prompt example 3',
  },
  {
    id: '4',
    src: '/showcase/seevideo/prompt-4.png',
    alt: 'AI video prompt example 4',
  },
] as const;

/** Kept for older blocks that still import showcaseItems */
export const showcaseItems = [
  ...promptGallery,
  {
    id: 'aurora-dancer',
    src: '/showcase/showcase-aurora-dancer.jpg',
    alt: 'Aurora dancer',
  },
  {
    id: 'neon-alley',
    src: '/showcase/showcase-neon-alley.jpg',
    alt: 'Neon alley',
  },
  {
    id: 'coastal-drive',
    src: '/showcase/showcase-coastal-drive.jpg',
    alt: 'Coastal drive',
  },
  {
    id: 'galaxy-teapot',
    src: '/showcase/showcase-galaxy-teapot.jpg',
    alt: 'Galaxy teapot',
  },
] as const;

export const heroGallery = promptGallery;

export const videoModels = modelCatalog
  .filter((m) => m.kind === 'video')
  .map((m) => ({
    id: m.id,
    title: m.name,
    href: m.href,
    blurb: m.blurb,
  }));
