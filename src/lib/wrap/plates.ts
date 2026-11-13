/**
 * Starter license-plate backgrounds for Paint Shop. Plate PNGs are a
 * separate file from the body wrap — the editor only deep-links here.
 */

export interface PlateDesign {
  id: string;
  title: string;
  region: string;
  cover: string;
}

export const PLATE_DESIGNS: PlateDesign[] = [
  {
    id: 'plate-01',
    title: 'Midnight Matte',
    region: 'US',
    cover: '/wrap/plates/plate-01.webp',
  },
  {
    id: 'plate-02',
    title: 'Coastal White',
    region: 'US',
    cover: '/wrap/plates/plate-02.webp',
  },
  {
    id: 'plate-03',
    title: 'Graphite Frame',
    region: 'EU',
    cover: '/wrap/plates/plate-03.webp',
  },
  {
    id: 'plate-04',
    title: 'Desert Sand',
    region: 'US',
    cover: '/wrap/plates/plate-04.webp',
  },
  {
    id: 'plate-05',
    title: 'Alpine Frost',
    region: 'EU',
    cover: '/wrap/plates/plate-05.webp',
  },
  {
    id: 'plate-06',
    title: 'Racing Stripe',
    region: 'US',
    cover: '/wrap/plates/plate-06.webp',
  },
  {
    id: 'plate-07',
    title: 'Neon Outline',
    region: 'JP',
    cover: '/wrap/plates/plate-07.webp',
  },
  {
    id: 'plate-08',
    title: 'Classic Chrome',
    region: 'US',
    cover: '/wrap/plates/plate-08.webp',
  },
];

export function getPlateDesign(id: string): PlateDesign | undefined {
  return PLATE_DESIGNS.find((p) => p.id === id);
}
