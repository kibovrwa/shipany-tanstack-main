import { WRAP_PNG_LIMITS } from '@/config/wrap';

export interface WrapPngResult {
  blob: Blob;
  width: number;
  height: number;
  /** True when colours were reduced to fit under the size limit. */
  reduced: boolean;
}

/**
 * File names the car accepts: letters, digits, spaces, dashes and
 * underscores, at most 30 characters (without the extension).
 */
export function sanitizeWrapName(name: string): string {
  const clean = name
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9 _-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, WRAP_PNG_LIMITS.maxNameLength)
    .trim();
  return clean || 'wrap';
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed'))),
      'image/png'
    );
  });
}

function scaled(
  source: HTMLCanvasElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

function posterize(source: HTMLCanvasElement, bits: number): HTMLCanvasElement {
  const canvas = scaled(source, source.width, source.height);
  const ctx = canvas.getContext('2d')!;
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  const step = 255 / ((1 << bits) - 1);
  for (let i = 0; i < px.length; i += 4) {
    px[i] = Math.round(Math.round(px[i] / step) * step);
    px[i + 1] = Math.round(Math.round(px[i + 1] / step) * step);
    px[i + 2] = Math.round(Math.round(px[i + 2] / step) * step);
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

/**
 * Encodes a wrap as a PNG the car will accept: at most `size` pixels on the
 * long edge (512–1024) and under 1 MB. Oversized results are scaled down
 * first, then colour-reduced.
 */
export async function exportWrapPng(
  source: HTMLCanvasElement,
  size: number = WRAP_PNG_LIMITS.maxSize
): Promise<WrapPngResult> {
  const { minSize, maxSize, maxBytes } = WRAP_PNG_LIMITS;
  const long = Math.max(source.width, source.height);
  const aspect = source.width / source.height;
  const dims = (edge: number): [number, number] =>
    aspect >= 1
      ? [edge, Math.round(edge / aspect)]
      : [Math.round(edge * aspect), edge];

  const first = Math.min(maxSize, Math.max(minSize, Math.round(size)));
  const edges = [first, 896, 768, 640, 512].filter(
    (e, i) => i === 0 || e < first
  );

  let last: WrapPngResult | null = null;
  for (const edge of edges) {
    const [w, h] = dims(edge);
    const canvas = edge === long ? source : scaled(source, w, h);
    const blob = await toBlob(canvas);
    last = { blob, width: w, height: h, reduced: false };
    if (blob.size <= maxBytes) return last;
  }

  const [w, h] = dims(edges[edges.length - 1]);
  const small = scaled(source, w, h);
  for (const bits of [5, 4, 3]) {
    const blob = await toBlob(posterize(small, bits));
    last = { blob, width: w, height: h, reduced: true };
    if (blob.size <= maxBytes) return last;
  }
  return last!;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadCanvasPng(
  canvas: HTMLCanvasElement,
  name: string,
  size?: number
): Promise<WrapPngResult> {
  const result = await exportWrapPng(canvas, size);
  downloadBlob(result.blob, `${sanitizeWrapName(name)}.png`);
  return result;
}

export interface PngCheck {
  width: number;
  height: number;
  bytes: number;
  isPng: boolean;
  sizeOk: boolean;
  bytesOk: boolean;
  nameOk: boolean;
}

/** Validates a file against the Paint Shop upload rules. */
export async function checkWrapPng(file: File): Promise<PngCheck> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const isPng = signature.every((b, i) => head[i] === b);
  let width = 0;
  let height = 0;
  try {
    const bitmap = await createImageBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    bitmap.close();
  } catch {
    // Not a decodable image.
  }
  const { minSize, maxSize, maxBytes, maxNameLength } = WRAP_PNG_LIMITS;
  const base = file.name.replace(/\.[^.]+$/, '');
  return {
    width,
    height,
    bytes: file.size,
    isPng,
    sizeOk:
      width >= minSize &&
      height >= minSize * 0.5 &&
      width <= maxSize &&
      height <= maxSize,
    bytesOk: file.size <= maxBytes,
    nameOk: base.length <= maxNameLength && /^[A-Za-z0-9 _-]+$/.test(base),
  };
}