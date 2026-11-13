/**
 * Single swap point for brand name, logo, contact, and launch SEO.
 * Dylan: change these (and messages/*.json) before launch — no hunt-and-peck.
 *
 * Product reference: seevideo.ai (multi-model video SaaS). Brand copy here is
 * easy to replace when Dylan launches under his own name.
 */
export const brand = {
  name: 'SeeVideo',
  shortName: 'SeeVideo',
  tagline: 'Create Stunning AI Videos with Seedance 2.0 for Free',
  logo: '/brand/logo.svg',
  favicon: '/brand/icon.svg',
  contactEmail: 'help@seevideo.ai',
  copyrightYear: 2026,
  domainLabel: 'SeeVideo.ai',
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
