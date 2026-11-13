import type { PatternRecipe } from './patterns';

/** How a region is painted: flat colour, linear gradient or procedural pattern. */
export type WrapPaint =
  | { kind: 'solid'; color: string }
  | { kind: 'gradient'; colors: string[]; angle: number }
  | { kind: 'pattern'; recipe: PatternRecipe };

interface LayerBase {
  id: string;
  name: string;
  /** Centre of the layer in template pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Degrees, clockwise. */
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
}

export interface ImageLayer extends LayerBase {
  type: 'image';
  assetId: string;
}

export interface TextLayer extends LayerBase {
  type: 'text';
  text: string;
  fontFamily: string;
  fontWeight: number;
  color: string;
}

export interface ShapeLayer extends LayerBase {
  type: 'rect' | 'ellipse';
  fill: string;
  radius: number;
}

export interface PathLayer extends LayerBase {
  type: 'path';
  /** Flat x,y pairs in a unit box (0–1) that scales with width/height. */
  points: number[];
  color: string;
  /** Stroke width in template pixels at the size the path was drawn. */
  stroke: number;
}

/** Covers the whole template; position and size are ignored. */
export interface FillLayer extends LayerBase {
  type: 'fill';
  paint: WrapPaint;
}

export type WrapLayer =
  | ImageLayer
  | TextLayer
  | ShapeLayer
  | PathLayer
  | FillLayer;

export interface WrapDoc {
  version: 1;
  vehicle: string;
  width: number;
  height: number;
  /** Bottom to top. */
  layers: WrapLayer[];
}

export const WRAP_FONTS = [
  'Inter Variable',
  'Georgia',
  'Impact',
  'Courier New',
  'Brush Script MT',
];

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function emptyDoc(vehicle: {
  slug: string;
  width: number;
  height: number;
}): WrapDoc {
  return {
    version: 1,
    vehicle: vehicle.slug,
    width: vehicle.width,
    height: vehicle.height,
    layers: [],
  };
}

function base(doc: WrapDoc, name: string): LayerBase {
  return {
    id: uid(),
    name,
    x: doc.width / 2,
    y: doc.height / 2,
    width: doc.width,
    height: doc.height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
  };
}

export function fillLayer(doc: WrapDoc, name: string, paint: WrapPaint): FillLayer {
  return { ...base(doc, name), type: 'fill', paint };
}

export function imageLayer(
  doc: WrapDoc,
  name: string,
  assetId: string,
  natural: { width: number; height: number },
  options: { cover?: boolean; maxFraction?: number } = {}
): ImageLayer {
  const ratio = natural.width / natural.height || 1;
  let width: number;
  let height: number;
  if (options.cover) {
    const scale = Math.max(doc.width / natural.width, doc.height / natural.height);
    width = natural.width * scale;
    height = natural.height * scale;
  } else {
    const limit = Math.min(doc.width, doc.height) * (options.maxFraction ?? 0.4);
    width = ratio >= 1 ? limit : limit * ratio;
    height = ratio >= 1 ? limit / ratio : limit;
  }
  return { ...base(doc, name), type: 'image', assetId, width, height };
}

export function textLayer(
  doc: WrapDoc,
  name: string,
  text: string,
  at?: { x: number; y: number }
): TextLayer {
  return {
    ...base(doc, name),
    ...(at ?? {}),
    type: 'text',
    text,
    fontFamily: WRAP_FONTS[0],
    fontWeight: 800,
    color: '#111111',
    width: 0,
    height: Math.round(doc.height * 0.07),
  };
}

export function shapeLayer(
  doc: WrapDoc,
  name: string,
  type: 'rect' | 'ellipse',
  box: { x: number; y: number; width: number; height: number },
  fill: string
): ShapeLayer {
  return { ...base(doc, name), ...box, type, fill, radius: 0 };
}

/** Builds a path layer from absolute template points. */
export function pathLayer(
  doc: WrapDoc,
  name: string,
  absolute: number[],
  color: string,
  stroke: number
): PathLayer | null {
  if (absolute.length < 4) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < absolute.length; i += 2) {
    minX = Math.min(minX, absolute[i]);
    maxX = Math.max(maxX, absolute[i]);
    minY = Math.min(minY, absolute[i + 1]);
    maxY = Math.max(maxY, absolute[i + 1]);
  }
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const points = absolute.map((v, i) =>
    i % 2 === 0 ? (v - minX) / width : (v - minY) / height
  );
  return {
    ...base(doc, name),
    type: 'path',
    x: minX + width / 2,
    y: minY + height / 2,
    width,
    height,
    points,
    color,
    stroke,
  };
}

export function isFill(layer: WrapLayer): layer is FillLayer {
  return layer.type === 'fill';
}

/** Template point → the layer's own unrotated frame, origin at its centre. */
export function toLocal(
  layer: WrapLayer,
  x: number,
  y: number
): { x: number; y: number } {
  const a = (-layer.rotation * Math.PI) / 180;
  const dx = x - layer.x;
  const dy = y - layer.y;
  return {
    x: dx * Math.cos(a) - dy * Math.sin(a),
    y: dx * Math.sin(a) + dy * Math.cos(a),
  };
}

/** Topmost selectable layer under a template point. */
export function hitTest(
  doc: WrapDoc,
  x: number,
  y: number,
  slop = 0
): WrapLayer | null {
  for (let i = doc.layers.length - 1; i >= 0; i--) {
    const layer = doc.layers[i];
    if (!layer.visible || layer.locked || isFill(layer)) continue;
    const p = toLocal(layer, x, y);
    const pad = slop + (layer.type === 'path' ? layer.stroke / 2 : 0);
    if (
      Math.abs(p.x) <= layer.width / 2 + pad &&
      Math.abs(p.y) <= layer.height / 2 + pad
    ) {
      return layer;
    }
  }
  return null;
}

export function updateLayer(
  doc: WrapDoc,
  id: string,
  patch: Partial<WrapLayer>
): WrapDoc {
  return {
    ...doc,
    layers: doc.layers.map((l) =>
      l.id === id ? ({ ...l, ...patch } as WrapLayer) : l
    ),
  };
}

export function addLayer(doc: WrapDoc, layer: WrapLayer): WrapDoc {
  // Fills belong under the artwork: slot a new one above the existing fills.
  if (isFill(layer)) {
    const firstArt = doc.layers.findIndex((l) => !isFill(l));
    const at = firstArt === -1 ? doc.layers.length : firstArt;
    return {
      ...doc,
      layers: [...doc.layers.slice(0, at), layer, ...doc.layers.slice(at)],
    };
  }
  return { ...doc, layers: [...doc.layers, layer] };
}

export function removeLayer(doc: WrapDoc, id: string): WrapDoc {
  return { ...doc, layers: doc.layers.filter((l) => l.id !== id) };
}

export function moveLayer(doc: WrapDoc, id: string, delta: number): WrapDoc {
  const from = doc.layers.findIndex((l) => l.id === id);
  if (from === -1) return doc;
  const to = Math.max(0, Math.min(doc.layers.length - 1, from + delta));
  if (to === from) return doc;
  const layers = doc.layers.slice();
  const [layer] = layers.splice(from, 1);
  layers.splice(to, 0, layer);
  return { ...doc, layers };
}

export function duplicateLayer(doc: WrapDoc, id: string): [WrapDoc, string] {
  const index = doc.layers.findIndex((l) => l.id === id);
  if (index === -1) return [doc, id];
  const source = doc.layers[index];
  const copy = {
    ...source,
    id: uid(),
    x: source.x + (isFill(source) ? 0 : 24),
    y: source.y + (isFill(source) ? 0 : 24),
  } as WrapLayer;
  const layers = doc.layers.slice();
  layers.splice(index + 1, 0, copy);
  return [{ ...doc, layers }, copy.id];
}

/** Replaces every fill with one new fill (colour, gradient or pattern). */
export function setBaseFill(doc: WrapDoc, name: string, paint: WrapPaint): WrapDoc {
  const art = doc.layers.filter((l) => !isFill(l));
  return { ...doc, layers: [fillLayer(doc, name, paint), ...art] };
}

export function assetIds(doc: WrapDoc): string[] {
  return doc.layers.flatMap((l) => (l.type === 'image' ? [l.assetId] : []));
}

/** Accepts only documents this editor wrote; anything else is discarded. */
export function parseDoc(value: unknown): WrapDoc | null {
  if (!value || typeof value !== 'object') return null;
  const doc = value as WrapDoc;
  if (
    doc.version !== 1 ||
    typeof doc.vehicle !== 'string' ||
    typeof doc.width !== 'number' ||
    typeof doc.height !== 'number' ||
    !Array.isArray(doc.layers)
  ) {
    return null;
  }
  const types = ['image', 'text', 'rect', 'ellipse', 'path', 'fill'];
  const layers = doc.layers.filter(
    (l) =>
      l &&
      typeof l.id === 'string' &&
      types.includes(l.type) &&
      Number.isFinite(l.x) &&
      Number.isFinite(l.y)
  );
  return { ...doc, layers };
}