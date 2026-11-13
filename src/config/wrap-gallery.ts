import type { PatternRecipe } from '@/lib/wrap/patterns';

/**
 * Starter gallery. Every design is an original procedural recipe (see
 * `src/lib/wrap/patterns.ts`): the wrap PNG is drawn in the browser and the
 * cover renders in `public/wrap/gallery/` are produced from the same recipe
 * by `scripts/wrap/render-covers.mjs`. Authors are placeholder handles.
 */
export type WrapCategory =
  | 'gradient'
  | 'racing'
  | 'camo'
  | 'geometric'
  | 'nature'
  | 'space'
  | 'retro'
  | 'minimal';

export interface WrapDesign {
  id: string;
  title: string;
  vehicle: string;
  author: string;
  category: WrapCategory;
  recipe: PatternRecipe;
  featured?: boolean;
}

export const WRAP_CATEGORIES: WrapCategory[] = [
  'gradient',
  'racing',
  'camo',
  'geometric',
  'nature',
  'space',
  'retro',
  'minimal',
];

export const WRAP_DESIGNS: WrapDesign[] = [
  {
    id: 'aurora-fade',
    title: 'Aurora Fade',
    vehicle: 'modely-2025-premium',
    author: 'northlight',
    category: 'gradient',
    recipe: { kind: 'gradient', colors: ['#22d3ee', '#6366f1', '#d946ef'], angle: 70 },
    featured: true,
  },
  {
    id: 'ember-low-poly',
    title: 'Ember Low Poly',
    vehicle: 'model3-2024-base',
    author: 'polyforge',
    category: 'geometric',
    recipe: { kind: 'lowpoly', colors: ['#fde047', '#f97316', '#b91c1c', '#450a0a'], seed: 7, angle: 80 },
    featured: true,
  },
  {
    id: 'midnight-circuit',
    title: 'Midnight Circuit',
    vehicle: 'cybertruck',
    author: 'tracewave',
    category: 'geometric',
    recipe: { kind: 'circuit', colors: ['#0b1020', '#22d3ee', '#a78bfa'], seed: 11 },
    featured: true,
  },
  {
    id: 'forest-camo',
    title: 'Forest Camo',
    vehicle: 'modely',
    author: 'trailhead',
    category: 'camo',
    recipe: { kind: 'camo', colors: ['#3f4a2b', '#1f2a17', '#7a8450', '#b9b38a'], seed: 3 },
    featured: true,
  },
  {
    id: 'track-day-red',
    title: 'Track Day Red',
    vehicle: 'model3-2024-performance',
    author: 'apexline',
    category: 'racing',
    recipe: { kind: 'racing', colors: ['#dc2626', '#ffffff', '#111827'] },
    featured: true,
  },
  {
    id: 'deep-nebula',
    title: 'Deep Nebula',
    vehicle: 'models-2025-plaid',
    author: 'orbital',
    category: 'space',
    recipe: { kind: 'galaxy', colors: ['#0f0a2a', '#7c3aed', '#ec4899', '#22d3ee'], seed: 21 },
    featured: true,
  },
  {
    id: 'retro-sunset',
    title: 'Retro Sunset',
    vehicle: 'modely-2025-premium',
    author: 'vhsdrive',
    category: 'retro',
    recipe: { kind: 'sunset', colors: ['#1e1b4b', '#be185d', '#fb923c', '#fde047', '#1e1b4b'] },
    featured: true,
  },
  {
    id: 'carbon-weave',
    title: 'Carbon Weave',
    vehicle: 'modelx-2021',
    author: 'drylayup',
    category: 'minimal',
    recipe: { kind: 'carbon', colors: ['#1c1c1e', '#4b4b50', '#ef4444'] },
    featured: true,
  },
  {
    id: 'ocean-swell',
    title: 'Ocean Swell',
    vehicle: 'modely-l',
    author: 'tidechart',
    category: 'nature',
    recipe: { kind: 'waves', colors: ['#e0f2fe', '#38bdf8', '#0369a1', '#0c1e3a'], seed: 5 },
    featured: true,
  },
  {
    id: 'honeycomb-gold',
    title: 'Honeycomb Gold',
    vehicle: 'modely-2025-performance',
    author: 'hexworks',
    category: 'geometric',
    recipe: { kind: 'hex', colors: ['#18181b', '#facc15', '#f59e0b', '#fde68a'], seed: 9 },
    featured: true,
  },
  {
    id: 'zebra-crossing',
    title: 'Zebra Crossing',
    vehicle: 'model3',
    author: 'savanna',
    category: 'nature',
    recipe: { kind: 'zebra', colors: ['#fafafa', '#111111'], seed: 2 },
    featured: true,
  },
  {
    id: 'paint-party',
    title: 'Paint Party',
    vehicle: 'modely-2025-base',
    author: 'dripstudio',
    category: 'retro',
    recipe: { kind: 'splatter', colors: ['#fafafa', '#ef4444', '#3b82f6', '#facc15', '#22c55e'], seed: 14 },
    featured: true,
  },
  {
    id: 'pixel-dusk',
    title: 'Pixel Dusk',
    vehicle: 'cybertruck',
    author: 'eightbit',
    category: 'retro',
    recipe: { kind: 'mosaic', colors: ['#fbbf24', '#f472b6', '#7c3aed', '#1e1b4b'], seed: 4 },
    featured: true,
  },
  {
    id: 'contour-lines',
    title: 'Contour Lines',
    vehicle: 'models-2021',
    author: 'basecamp',
    category: 'nature',
    recipe: { kind: 'topo', colors: ['#064e3b', '#0f766e', '#a7f3d0'], seed: 8 },
    featured: true,
  },
  {
    id: 'checkered-finish',
    title: 'Checkered Finish',
    vehicle: 'model3-2024-performance',
    author: 'pitlane',
    category: 'racing',
    recipe: { kind: 'checker', colors: ['#111111', '#ffffff'] },
    featured: true,
  },
  {
    id: 'halftone-pop',
    title: 'Halftone Pop',
    vehicle: 'modely-2025-premium',
    author: 'inkpress',
    category: 'retro',
    recipe: { kind: 'halftone', colors: ['#f43f5e', '#f59e0b', '#fff7ed'], angle: 90 },
    featured: true,
  },
  {
    id: 'snow-leopard',
    title: 'Snow Leopard',
    vehicle: 'modelx-2021',
    author: 'highpass',
    category: 'nature',
    recipe: { kind: 'spots', colors: ['#e7e5e4', '#1c1917', '#a8a29e'], seed: 6 },
    featured: true,
  },
  {
    id: 'candy-stripes',
    title: 'Candy Stripes',
    vehicle: 'modely',
    author: 'sweetshop',
    category: 'retro',
    recipe: { kind: 'stripes', colors: ['#fff1f2', '#fb7185', '#38bdf8'], angle: 35 },
    featured: true,
  },
  {
    id: 'desert-camo',
    title: 'Desert Camo',
    vehicle: 'cybertruck',
    author: 'dunerunner',
    category: 'camo',
    recipe: { kind: 'camo', colors: ['#c8ad7f', '#8a6d3b', '#e6d5b8', '#5c4a2a'], seed: 19 },
    featured: true,
  },
  {
    id: 'arctic-camo',
    title: 'Arctic Camo',
    vehicle: 'modely-2025-performance',
    author: 'whiteout',
    category: 'camo',
    recipe: { kind: 'camo', colors: ['#f4f4f5', '#a1a1aa', '#52525b', '#d4d4d8'], seed: 23 },
    featured: true,
  },
  {
    id: 'glacier-poly',
    title: 'Glacier Poly',
    vehicle: 'modely-l',
    author: 'polyforge',
    category: 'geometric',
    recipe: { kind: 'lowpoly', colors: ['#ecfeff', '#67e8f9', '#0284c7', '#1e3a8a'], seed: 31, angle: 100 },
    featured: true,
  },
  {
    id: 'grape-soda',
    title: 'Grape Soda',
    vehicle: 'model3-2024-base',
    author: 'northlight',
    category: 'gradient',
    recipe: { kind: 'radial', colors: ['#f0abfc', '#a855f7', '#3b0764'] },
    featured: true,
  },
  {
    id: 'mint-condition',
    title: 'Mint Condition',
    vehicle: 'modely-2025-base',
    author: 'softserve',
    category: 'gradient',
    recipe: { kind: 'gradient', colors: ['#ecfdf5', '#6ee7b7', '#0d9488'], angle: 110 },
    featured: true,
  },
  {
    id: 'gulf-run',
    title: 'Coastal Racer',
    vehicle: 'models-2021',
    author: 'apexline',
    category: 'racing',
    recipe: { kind: 'racing', colors: ['#7dd3fc', '#f97316', '#0c4a6e'] },
    featured: true,
  },
  {
    id: 'neon-grid',
    title: 'Neon Grid',
    vehicle: 'models-2025-plaid',
    author: 'tracewave',
    category: 'geometric',
    recipe: { kind: 'circuit', colors: ['#1a0b2e', '#f472b6', '#facc15'], seed: 41 },
  },
  {
    id: 'lava-flow',
    title: 'Lava Flow',
    vehicle: 'cybertruck',
    author: 'magma',
    category: 'nature',
    recipe: { kind: 'waves', colors: ['#fde047', '#f97316', '#b91c1c', '#1c1917'], seed: 12 },
  },
  {
    id: 'tiger-claw',
    title: 'Tiger Stripe',
    vehicle: 'model3',
    author: 'savanna',
    category: 'nature',
    recipe: { kind: 'zebra', colors: ['#f59e0b', '#1c1917'], seed: 17, scale: 0.8 },
  },
  {
    id: 'bubblegum',
    title: 'Bubblegum',
    vehicle: 'modely-2025-premium',
    author: 'sweetshop',
    category: 'gradient',
    recipe: { kind: 'gradient', colors: ['#fbcfe8', '#f472b6', '#a78bfa'], angle: 45 },
  },
  {
    id: 'stealth-hex',
    title: 'Stealth Hex',
    vehicle: 'cybertruck',
    author: 'hexworks',
    category: 'minimal',
    recipe: { kind: 'hex', colors: ['#0a0a0a', '#262626', '#404040', '#171717'], seed: 27 },
  },
  {
    id: 'starfield',
    title: 'Starfield',
    vehicle: 'modelx-2021',
    author: 'orbital',
    category: 'space',
    recipe: { kind: 'galaxy', colors: ['#020617', '#1d4ed8', '#0ea5e9', '#f8fafc'], seed: 33 },
  },
  {
    id: 'solar-flare',
    title: 'Solar Flare',
    vehicle: 'model3-2024-performance',
    author: 'orbital',
    category: 'space',
    recipe: { kind: 'galaxy', colors: ['#1c0a00', '#f97316', '#facc15', '#ef4444'], seed: 44 },
  },
  {
    id: 'blueprint',
    title: 'Blueprint',
    vehicle: 'modely-2025-base',
    author: 'basecamp',
    category: 'minimal',
    recipe: { kind: 'topo', colors: ['#1e3a8a', '#1d4ed8', '#bfdbfe'], seed: 18, scale: 0.8 },
  },
  {
    id: 'urban-camo',
    title: 'Urban Camo',
    vehicle: 'model3-2024-base',
    author: 'trailhead',
    category: 'camo',
    recipe: { kind: 'camo', colors: ['#27272a', '#52525b', '#18181b', '#a1a1aa'], seed: 29 },
  },
  {
    id: 'citrus-pop',
    title: 'Citrus Pop',
    vehicle: 'modely',
    author: 'inkpress',
    category: 'retro',
    recipe: { kind: 'halftone', colors: ['#84cc16', '#facc15', '#14532d'], angle: 90, scale: 1.2 },
  },
  {
    id: 'pit-stripes',
    title: 'Pit Stripes',
    vehicle: 'modely-2025-performance',
    author: 'pitlane',
    category: 'racing',
    recipe: { kind: 'stripes', colors: ['#111827', '#facc15', '#f8fafc'], angle: 65, scale: 1.3 },
  },
  {
    id: 'sakura-mosaic',
    title: 'Blossom Mosaic',
    vehicle: 'modely-l',
    author: 'eightbit',
    category: 'retro',
    recipe: { kind: 'mosaic', colors: ['#fff1f2', '#fda4af', '#fb7185', '#881337'], seed: 13, scale: 0.75 },
  },
  {
    id: 'graphite',
    title: 'Graphite Fade',
    vehicle: 'models-2021',
    author: 'drylayup',
    category: 'minimal',
    recipe: { kind: 'gradient', colors: ['#e5e7eb', '#6b7280', '#111827'], angle: 90 },
  },
  {
    id: 'royal-carbon',
    title: 'Royal Carbon',
    vehicle: 'models-2025-plaid',
    author: 'drylayup',
    category: 'minimal',
    recipe: { kind: 'carbon', colors: ['#0f172a', '#334155', '#38bdf8'], scale: 1.2 },
  },
  {
    id: 'jungle-spots',
    title: 'Jungle Spots',
    vehicle: 'model3',
    author: 'highpass',
    category: 'nature',
    recipe: { kind: 'spots', colors: ['#d9a441', '#1c1917', '#8a5a1c'], seed: 37 },
  },
  {
    id: 'ink-storm',
    title: 'Ink Storm',
    vehicle: 'modelx-2021',
    author: 'dripstudio',
    category: 'retro',
    recipe: { kind: 'splatter', colors: ['#111827', '#f8fafc', '#22d3ee', '#f472b6'], seed: 52 },
  },
];

export function getWrapDesign(id: string): WrapDesign | undefined {
  return WRAP_DESIGNS.find((d) => d.id === id);
}