/** Original vector stickers, drawn in a unit box centred on the origin. */
export type StickerKind = 'star' | 'bolt' | 'flame' | 'heart';

export const STICKERS: { kind: StickerKind; color: string }[] = [
  { kind: 'star', color: '#facc15' },
  { kind: 'bolt', color: '#38bdf8' },
  { kind: 'flame', color: '#f97316' },
  { kind: 'heart', color: '#f43f5e' },
];

type Ctx = CanvasRenderingContext2D;

function path(ctx: Ctx, kind: StickerKind) {
  ctx.beginPath();
  if (kind === 'star') {
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.5 : 0.21;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
  } else if (kind === 'bolt') {
    const pts = [
      [0.1, -0.5],
      [-0.3, 0.06],
      [-0.04, 0.06],
      [-0.14, 0.5],
      [0.3, -0.1],
      [0.04, -0.1],
    ];
    pts.forEach(([x, y]) => ctx.lineTo(x, y));
  } else if (kind === 'flame') {
    ctx.moveTo(0, -0.5);
    ctx.bezierCurveTo(0.12, -0.26, 0.4, -0.12, 0.36, 0.18);
    ctx.bezierCurveTo(0.33, 0.4, 0.16, 0.5, 0, 0.5);
    ctx.bezierCurveTo(-0.2, 0.5, -0.37, 0.36, -0.36, 0.14);
    ctx.bezierCurveTo(-0.35, 0, -0.26, -0.08, -0.2, -0.18);
    ctx.bezierCurveTo(-0.16, -0.06, -0.1, -0.02, -0.06, -0.04);
    ctx.bezierCurveTo(-0.12, -0.22, -0.08, -0.38, 0, -0.5);
  } else {
    ctx.moveTo(0, 0.46);
    ctx.bezierCurveTo(-0.62, 0.02, -0.5, -0.46, -0.22, -0.42);
    ctx.bezierCurveTo(-0.1, -0.4, -0.03, -0.32, 0, -0.24);
    ctx.bezierCurveTo(0.03, -0.32, 0.1, -0.4, 0.22, -0.42);
    ctx.bezierCurveTo(0.5, -0.46, 0.62, 0.02, 0, 0.46);
  }
  ctx.closePath();
}

export function drawSticker(
  ctx: Ctx,
  kind: StickerKind,
  color: string,
  x: number,
  y: number,
  size: number,
  rotation = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(size, size);
  ctx.lineJoin = 'round';
  path(ctx, kind);
  ctx.lineWidth = 0.12;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/** PNG data URL of a sticker, for the asset library and thumbnails. */
export function stickerDataUrl(
  kind: StickerKind,
  color: string,
  size = 256
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  drawSticker(
    canvas.getContext('2d')!,
    kind,
    color,
    size / 2,
    size / 2,
    size * 0.82
  );
  return canvas.toDataURL('image/png');
}