import type { WrapVehicle, ZoneRect } from '@/config/wrap';

import type { TextLayer, WrapDoc, WrapLayer, WrapPaint } from './doc';
import { drawPattern } from './patterns';

type Ctx = CanvasRenderingContext2D;
export type WrapAsset = HTMLImageElement | HTMLCanvasElement | ImageBitmap;
export type AssetLookup = (id: string) => WrapAsset | undefined;

const LINE_HEIGHT = 1.15;
const patternCache = new Map<string, HTMLCanvasElement>();
let measureCtx: Ctx | null = null;

function fontOf(layer: TextLayer, size: number): string {
  return `${layer.fontWeight} ${size}px "${layer.fontFamily}", "Inter Variable", system-ui, sans-serif`;
}

function textLines(layer: TextLayer): string[] {
  return (layer.text || ' ').split('\n');
}

export function textFontSize(layer: TextLayer): number {
  return layer.height / (textLines(layer).length * LINE_HEIGHT);
}

/** Text layers keep their height; the width follows the text. */
export function fitText(layer: TextLayer): TextLayer {
  if (typeof document === 'undefined') return layer;
  measureCtx ??= document.createElement('canvas').getContext('2d')!;
  const size = textFontSize(layer);
  measureCtx.font = fontOf(layer, size);
  const width = Math.max(
    size * 0.5,
    ...textLines(layer).map((line) => measureCtx!.measureText(line).width)
  );
  return { ...layer, width: Math.ceil(width) };
}

export function paintCss(paint: WrapPaint): string {
  if (paint.kind === 'solid') return paint.color;
  if (paint.kind === 'gradient') {
    return `linear-gradient(${paint.angle}deg, ${paint.colors.join(', ')})`;
  }
  return `linear-gradient(135deg, ${paint.recipe.colors.slice(0, 3).join(', ')})`;
}

function fillPaint(ctx: Ctx, width: number, height: number, paint: WrapPaint) {
  if (paint.kind === 'solid') {
    ctx.fillStyle = paint.color;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  if (paint.kind === 'gradient') {
    // Same convention as CSS: 0deg points up, 90deg points right.
    const a = (paint.angle * Math.PI) / 180;
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    const half = (Math.abs(dx) * width + Math.abs(dy) * height) / 2;
    const cx = width / 2;
    const cy = height / 2;
    const gradient = ctx.createLinearGradient(
      cx - dx * half,
      cy - dy * half,
      cx + dx * half,
      cy + dy * half
    );
    const stops = paint.colors.length > 1 ? paint.colors : [paint.colors[0], paint.colors[0]];
    stops.forEach((color, i) => gradient.addColorStop(i / (stops.length - 1), color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  const key = `${width}x${height}:${JSON.stringify(paint.recipe)}`;
  let cached = patternCache.get(key);
  if (!cached) {
    cached = document.createElement('canvas');
    cached.width = width;
    cached.height = height;
    drawPattern(cached.getContext('2d')!, width, height, paint.recipe);
    if (patternCache.size > 24) patternCache.clear();
    patternCache.set(key, cached);
  }
  ctx.drawImage(cached, 0, 0);
}

function drawLayer(ctx: Ctx, doc: WrapDoc, layer: WrapLayer, assets: AssetLookup) {
  if (!layer.visible || layer.opacity <= 0) return;
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  if (layer.type === 'fill') {
    fillPaint(ctx, doc.width, doc.height, layer.paint);
    ctx.restore();
    return;
  }
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  const w = layer.width;
  const h = layer.height;
  switch (layer.type) {
    case 'image': {
      const asset = assets(layer.assetId);
      if (asset) ctx.drawImage(asset, -w / 2, -h / 2, w, h);
      break;
    }
    case 'text': {
      const lines = textLines(layer);
      const size = textFontSize(layer);
      ctx.font = fontOf(layer, size);
      ctx.fillStyle = layer.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const step = size * LINE_HEIGHT;
      lines.forEach((line, i) => {
        ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * step);
      });
      break;
    }
    case 'rect': {
      ctx.fillStyle = layer.fill;
      const r = Math.min(layer.radius, w / 2, h / 2);
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, r);
      ctx.fill();
      break;
    }
    case 'ellipse': {
      ctx.fillStyle = layer.fill;
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'path': {
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = layer.stroke;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < layer.points.length; i += 2) {
        const px = (layer.points[i] - 0.5) * w;
        const py = (layer.points[i + 1] - 0.5) * h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      if (layer.points.length === 2) ctx.lineTo((layer.points[0] - 0.5) * w + 0.01, (layer.points[1] - 0.5) * h);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

/** Draws the artwork only (transparent where nothing is painted). */
export function renderArt(ctx: Ctx, doc: WrapDoc, assets: AssetLookup) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, doc.width, doc.height);
  for (const layer of doc.layers) drawLayer(ctx, doc, layer, assets);
}

export interface WrapTemplate {
  /** White panels on transparent: doubles as the clipping mask. */
  panels: HTMLCanvasElement;
  /** Panel seams only, drawn over the artwork as a guide. */
  outline: HTMLCanvasElement;
  /** False when the official file could not be loaded and a guide was drawn. */
  official: boolean;
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** Splits a template image into its panel mask and its seam lines. */
function splitTemplate(image: CanvasImageSource, width: number, height: number) {
  const panels = makeCanvas(width, height);
  const pctx = panels.getContext('2d', { willReadFrequently: true })!;
  pctx.drawImage(image, 0, 0, width, height);
  const data = pctx.getImageData(0, 0, width, height);
  const outline = makeCanvas(width, height);
  const octx = outline.getContext('2d')!;
  const lines = octx.createImageData(width, height);
  const src = data.data;
  const dst = lines.data;
  for (let i = 0; i < src.length; i += 4) {
    const alpha = src[i + 3];
    if (alpha === 0) continue;
    const luma = (src[i] * 299 + src[i + 1] * 587 + src[i + 2] * 114) / 1000;
    if (luma < 150) {
      dst[i] = dst[i + 1] = dst[i + 2] = 20;
      dst[i + 3] = Math.round(((150 - luma) / 150) * alpha);
    }
    src[i] = src[i + 1] = src[i + 2] = 255;
  }
  pctx.putImageData(data, 0, 0);
  octx.putImageData(lines, 0, 0);
  return { panels, outline };
}

/** A plain panel guide built from the vehicle's zones. */
function guideTemplate(vehicle: WrapVehicle): WrapTemplate {
  const { width, height, zones } = vehicle;
  const panels = makeCanvas(width, height);
  const outline = makeCanvas(width, height);
  const pctx = panels.getContext('2d')!;
  const octx = outline.getContext('2d')!;
  const vertical = zones.axis === 'vertical';
  const mirror = (r: ZoneRect): ZoneRect =>
    vertical ? [1 - r[2], r[1], 1 - r[0], r[3]] : [r[0], 1 - r[3], r[2], 1 - r[1]];
  const roof: ZoneRect = vertical
    ? [zones.hood[0], zones.hood[3], zones.hood[2], zones.trunk[1]]
    : [zones.hood[2], zones.hood[1], zones.trunk[0], zones.hood[3]];
  const rects = [
    zones.front,
    zones.hood,
    roof,
    zones.trunk,
    zones.rear,
    zones.left,
    mirror(zones.left),
  ];
  pctx.fillStyle = '#ffffff';
  octx.strokeStyle = 'rgba(20,20,20,0.75)';
  octx.lineWidth = 3;
  for (const r of rects) {
    const x = r[0] * width;
    const y = r[1] * height;
    const w = (r[2] - r[0]) * width;
    const h = (r[3] - r[1]) * height;
    const radius = Math.min(w, h) * 0.12;
    pctx.beginPath();
    pctx.roundRect(x, y, w, h, radius);
    pctx.fill();
    octx.beginPath();
    octx.roundRect(x + 1.5, y + 1.5, w - 3, h - 3, radius);
    octx.stroke();
  }
  return { panels, outline, official: false };
}

/**
 * Loads the vehicle's official template (cross-origin, CORS-enabled), or
 * falls back to a drawn panel guide when it is unavailable.
 */
export function loadTemplate(
  vehicle: WrapVehicle,
  url: string | null
): Promise<WrapTemplate> {
  if (!url) return Promise.resolve(guideTemplate(vehicle));
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    const fallback = () => resolve(guideTemplate(vehicle));
    const timer = setTimeout(fallback, 12000);
    image.onload = () => {
      clearTimeout(timer);
      try {
        resolve({
          ...splitTemplate(image, vehicle.width, vehicle.height),
          official: true,
        });
      } catch {
        fallback();
      }
    };
    image.onerror = () => {
      clearTimeout(timer);
      fallback();
    };
    image.src = url;
  });
}

/**
 * What the editor shows: template panels under the artwork, optionally
 * clipped to the panels, with the seams on top.
 */
export function composeView(
  ctx: Ctx,
  art: HTMLCanvasElement,
  template: WrapTemplate | null,
  options: { clip: boolean; guides: boolean }
) {
  const { width, height } = art;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (template) ctx.drawImage(template.panels, 0, 0);
  ctx.drawImage(art, 0, 0);
  if (template && options.clip) {
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(template.panels, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (template && options.guides) {
    ctx.globalAlpha = 0.55;
    ctx.drawImage(template.outline, 0, 0);
    ctx.globalAlpha = 1;
  }
}

/** The texture for the 3D car: body paint under the artwork, no guides. */
export function composeTexture(ctx: Ctx, art: HTMLCanvasElement, paint: string) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = paint;
  ctx.fillRect(0, 0, art.width, art.height);
  ctx.drawImage(art, 0, 0);
}

/** The file to export: artwork over white panels, clipped when asked. */
export function composeExport(
  art: HTMLCanvasElement,
  template: WrapTemplate | null,
  clip: boolean
): HTMLCanvasElement {
  const out = makeCanvas(art.width, art.height);
  const ctx = out.getContext('2d')!;
  if (template && clip) {
    composeView(ctx, art, template, { clip: true, guides: false });
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(art, 0, 0);
  }
  return out;
}

export function thumbnail(source: HTMLCanvasElement, size = 240): string {
  const scale = size / Math.max(source.width, source.height);
  const canvas = makeCanvas(
    Math.round(source.width * scale),
    Math.round(source.height * scale)
  );
  canvas.getContext('2d')!.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/webp', 0.8);
}