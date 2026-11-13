/**
 * Single swap point for brand name, logo, contact, and launch SEO.
 * Dylan: change these (and messages/*.json) before launch — no hunt-and-peck.
 */
export const brand = {
  name: 'Seedance AI',
  shortName: 'Seedance',
  tagline: 'Generate Video, Image & Voice',
  logo: '/brand/logo.png',
  favicon: '/brand/logo.png',
  contactEmail: 'help@seedance.ai',
  copyrightYear: 2026,
  domainLabel: 'seedance.ai',
} as const;

/**
 * Preview / staging builds stay noindex until flipped.
 * Set VITE_NOINDEX=false (or 0 / off) at launch to allow indexing.
 * Default: true (disallow crawlers).
 */
export function isNoindexEnabled(): boolean {
  const raw =
    (import.meta as any).env?.VITE_NOINDEX ??
    (typeof process !== 'undefined' ? process.env.VITE_NOINDEX : undefined) ??
    'true';
  const v = String(raw).trim().toLowerCase();
  return !(v === 'false' || v === '0' || v === 'off' || v === 'no');
}
