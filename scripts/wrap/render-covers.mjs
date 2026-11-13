#!/usr/bin/env node
/**
 * Renders the static car images used by the landing page and the gallery:
 *   public/wrap/vehicles/<slug>.webp   one unwrapped car per vehicle
 *   public/wrap/gallery/<id>.webp      one cover per design in wrap-gallery.ts
 *   public/wrap/hero-*.webp            hero and overview artwork
 *
 * It runs the app's own three.js scene in headless Chrome, so the pictures
 * always match the live 3D preview. Re-run it after changing a body shape or
 * the gallery recipes:
 *
 *   node scripts/wrap/render-covers.mjs [--only vehicles|gallery|hero]
 *
 * Needs `playwright-core` (or `playwright`) resolvable from Node and a Chrome
 * binary (CHROME_PATH, default /usr/local/bin/google-chrome).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const require = createRequire(import.meta.url);

async function load(name) {
  for (const base of [root, ...(process.env.NODE_PATH || '').split(':')]) {
    if (!base) continue;
    try {
      return require(require.resolve(name, { paths: [base] }));
    } catch {}
  }
  return null;
}

const playwright =
  (await load('playwright-core')) || (await load('playwright'));
if (!playwright) {
  console.error(
    'playwright-core not found. Install it (pnpm dlx playwright-core) or set NODE_PATH.'
  );
  process.exit(1);
}
const esbuild = require(
  require.resolve('esbuild', { paths: [require.resolve('tsx')] })
);

const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1]
  : null;

const bundle = await esbuild.build({
  entryPoints: [resolve(here, 'render-entry.ts')],
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  tsconfig: resolve(root, 'tsconfig.json'),
  define: { 'import.meta.env': '{}' },
  logLevel: 'error',
});

const browser = await playwright.chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/local/bin/google-chrome',
  headless: true,
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
page.on('console', (m) => {
  if (m.type() === 'error') console.error('[page]', m.text());
});
page.on('pageerror', (e) => console.error('[page]', e.message));
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: bundle.outputFiles[0].text });

const { vehicles, designs } = await page.evaluate(() => ({
  vehicles: window.wrapRender.vehicles,
  designs: window.wrapRender.designs,
}));

async function render(file, job) {
  const url = await page.evaluate((j) => window.wrapRender.renderCar(j), job);
  const out = resolve(root, 'public/wrap', file);
  mkdirSync(dirname(out), { recursive: true });
  const buf = Buffer.from(url.split(',')[1], 'base64');
  writeFileSync(out, buf);
  console.log(`${file}  ${(buf.length / 1024).toFixed(1)} KB`);
}

if (!only || only === 'vehicles') {
  for (const v of vehicles) {
    await render(`vehicles/${v.slug}.webp`, {
      vehicle: v.slug,
      width: 800,
      height: 800,
      azimuth: 40,
      elevation: 14,
      distance: 1.02,
      paint: v.body === 'truck' ? '#c9ccd1' : '#e9eaec',
      background: ['#1b1b1d', '#050505'],
    });
  }
}

if (!only || only === 'gallery') {
  for (const d of designs) {
    await render(`gallery/${d.id}.webp`, {
      vehicle: d.vehicle,
      recipe: d.recipe,
      width: 768,
      height: 480,
      azimuth: 36,
      elevation: 15,
      distance: 0.98,
    });
  }
}

if (!only || only === 'hero') {
  await render('hero-original.webp', {
    vehicle: 'modely-2025-premium',
    width: 336,
    height: 224,
    azimuth: 36,
    elevation: 15,
    distance: 0.95,
    paint: '#f2f3f5',
    background: ['#3a3a3d', '#1c1c1e'],
  });
  await render('og-cover.webp', {
    vehicle: 'modely-2025-premium',
    recipe: designs[0].recipe,
    width: 1200,
    height: 630,
    azimuth: 38,
    elevation: 14,
    distance: 1.0,
    background: ['#26262a', '#09090b'],
    quality: 0.86,
  });
}

await browser.close();