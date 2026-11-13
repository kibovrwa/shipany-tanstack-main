/**
 * Procedural wrap artwork. Every preset design in the gallery and the editor
 * is drawn by these generators, so the project ships no third-party imagery.
 * All functions are deterministic for a given recipe (seeded PRNG).
 */

export type PatternKind =
  | 'solid'
  | 'gradient'
  | 'radial'
  | 'stripes'
  | 'racing'
  | 'camo'
  | 'carbon'
  | 'lowpoly'
  | 'waves'
  | 'halftone'
  | 'galaxy'
  | 'checker'
  | 'topo'
  | 'splatter'
  | 'zebra'
  | 'hex'
  | 'sunset'
  | 'mosaic'
  | 'circuit'
  | 'spots';

export interface PatternRecipe {
  kind: PatternKind;
  colors: string[];
  seed?: number;
  /** Degrees, for directional patterns. */
  angle?: number;
  /** Relative feature size, 1 = default. */
  scale?: number;
}

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const l = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${l(r1, r2)},${l(g1, g2)},${l(b1, b2)})`;
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function linear(ctx: Ctx, w: number, h: number, angle: number) {
  const rad = (angle * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const len = (Math.abs(Math.cos(rad)) * w + Math.abs(Math.sin(rad)) * h) / 2;
  return ctx.createLinearGradient(
    cx - Math.cos(rad) * len,
    cy - Math.sin(rad) * len,
    cx + Math.cos(rad) * len,
    cy + Math.sin(rad) * len
  );
}

function fillGradient(
  ctx: Ctx,
  w: number,
  h: number,
  colors: string[],
  angle: number
) {
  const g = linear(ctx, w, h, angle);
  colors.forEach((c, i) =>
    g.addColorStop(colors.length === 1 ? 0 : i / (colors.length - 1), c)
  );
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function blob(
  ctx: Ctx,
  rnd: () => number,
  x: number,
  y: number,
  r: number,
  wobble = 0.45
) {
  const n = 9;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 - wobble + rnd() * wobble * 2);
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % n];
    const mx = (p0[0] + p1[0]) / 2;
    const my = (p0[1] + p1[1]) / 2;
    if (i === 0) ctx.moveTo(mx, my);
    const p2 = pts[(i + 2) % n];
    ctx.quadraticCurveTo(p1[0], p1[1], (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2);
  }
  ctx.closePath();
  ctx.fill();
}

const painters: Record<
  PatternKind,
  (ctx: Ctx, w: number, h: number, r: Required<PatternRecipe>) => void
> = {
  solid(ctx, w, h, r) {
    ctx.fillStyle = r.colors[0];
    ctx.fillRect(0, 0, w, h);
  },

  gradient(ctx, w, h, r) {
    fillGradient(ctx, w, h, r.colors, r.angle);
  },

  radial(ctx, w, h, r) {
    const g = ctx.createRadialGradient(
      w / 2,
      h * 0.42,
      0,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.72
    );
    r.colors.forEach((c, i) =>
      g.addColorStop(r.colors.length === 1 ? 0 : i / (r.colors.length - 1), c)
    );
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  },

  stripes(ctx, w, h, r) {
    ctx.fillStyle = r.colors[0];
    ctx.fillRect(0, 0, w, h);
    const band = 46 * r.scale;
    const d = Math.hypot(w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((r.angle * Math.PI) / 180);
    const others = r.colors.slice(1);
    let i = 0;
    for (let x = -d; x < d; x += band * 2, i++) {
      ctx.fillStyle = others[i % others.length];
      ctx.fillRect(x, -d, band, d * 2);
    }
    ctx.restore();
  },

  racing(ctx, w, h, r) {
    fillGradient(ctx, w, h, [r.colors[0], mix(r.colors[0], '#000000', 0.35)], 90);
    const [, c1, c2 = r.colors[1]] = r.colors;
    const cx = w / 2;
    const sw = w * 0.05 * r.scale;
    ctx.fillStyle = c1;
    ctx.fillRect(cx - sw * 1.6, 0, sw, h);
    ctx.fillRect(cx + sw * 0.6, 0, sw, h);
    ctx.fillStyle = c2;
    ctx.fillRect(cx - sw * 0.2, 0, sw * 0.4, h);
    // Rocker stripes on both side strips.
    for (const x of [w * 0.1, w * 0.9]) {
      ctx.fillStyle = c1;
      ctx.fillRect(x - sw * 0.5, 0, sw, h);
      ctx.fillStyle = c2;
      ctx.fillRect(x + (x < cx ? sw * 0.8 : -sw * 1.1), 0, sw * 0.3, h);
    }
  },

  camo(ctx, w, h, r) {
    const rnd = mulberry32(r.seed);
    ctx.fillStyle = r.colors[0];
    ctx.fillRect(0, 0, w, h);
    const others = r.colors.slice(1);
    const count = Math.round(170 / (r.scale * r.scale));
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = others[i % others.length];
      blob(ctx, rnd, rnd() * w, rnd() * h, (28 + rnd() * 62) * r.scale);
    }
  },

  carbon(ctx, w, h, r) {
    const [base, hi = '#3a3a3a'] = r.colors;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    const s = 14 * r.scale;
    for (let y = 0, row = 0; y < h; y += s, row++) {
      for (let x = 0, col = 0; x < w; x += s, col++) {
        const horizontal = (row + col) % 2 === 0;
        const g = horizontal
          ? ctx.createLinearGradient(x, y, x, y + s)
          : ctx.createLinearGradient(x, y, x + s, y);
        g.addColorStop(0, mix(base, '#000000', 0.5));
        g.addColorStop(0.5, hi);
        g.addColorStop(1, mix(base, '#000000', 0.5));
        ctx.fillStyle = g;
        ctx.fillRect(x + 0.5, y + 0.5, s - 1, s - 1);
      }
    }
    if (r.colors[2]) {
      ctx.fillStyle = r.colors[2];
      ctx.fillRect(w / 2 - w * 0.012, 0, w * 0.024, h);
    }
  },

  lowpoly(ctx, w, h, r) {
    const rnd = mulberry32(r.seed);
    const cell = 92 * r.scale;
    const cols = Math.ceil(w / cell) + 2;
    const rows = Math.ceil(h / cell) + 2;
    const pts: [number, number][][] = [];
    for (let j = 0; j < rows; j++) {
      pts.push([]);
      for (let i = 0; i < cols; i++) {
        pts[j].push([
          (i - 0.5) * cell + (rnd() - 0.5) * cell * 0.7,
          (j - 0.5) * cell + (rnd() - 0.5) * cell * 0.7,
        ]);
      }
    }
    const colorAt = (x: number, y: number) => {
      const rad = (r.angle * Math.PI) / 180;
      let t =
        ((x - w / 2) * Math.cos(rad) + (y - h / 2) * Math.sin(rad)) /
          Math.max(w, h) +
        0.5 +
        (rnd() - 0.5) * 0.16;
      t = Math.min(0.999, Math.max(0, t));
      const seg = t * (r.colors.length - 1);
      const i = Math.floor(seg);
      return mix(r.colors[i], r.colors[i + 1] ?? r.colors[i], seg - i);
    };
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = pts[j][i];
        const b = pts[j][i + 1];
        const c = pts[j + 1][i];
        const d = pts[j + 1][i + 1];
        for (const tri of [
          [a, b, c],
          [b, d, c],
        ]) {
          const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
          const cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
          const col = colorAt(cx, cy);
          ctx.fillStyle = col;
          ctx.strokeStyle = col;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tri[0][0], tri[0][1]);
          ctx.lineTo(tri[1][0], tri[1][1]);
          ctx.lineTo(tri[2][0], tri[2][1]);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  },

  waves(ctx, w, h, r) {
    const rnd = mulberry32(r.seed);
    ctx.fillStyle = r.colors[0];
    ctx.fillRect(0, 0, w, h);
    const bands = Math.round(11 / r.scale);
    const phase = rnd() * Math.PI * 2;
    for (let b = 0; b < bands; b++) {
      const t = b / (bands - 1);
      const seg = t * (r.colors.length - 1);
      const i = Math.floor(seg);
      ctx.fillStyle = mix(
        r.colors[i],
        r.colors[Math.min(i + 1, r.colors.length - 1)],
        seg - i
      );
      const y0 = (b / bands) * h * 1.15 - h * 0.05;
      const amp = h * 0.035 * (1 + rnd());
      const freq = 1.5 + rnd() * 2;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) {
        ctx.lineTo(
          x,
          y0 + Math.sin((x / w) * Math.PI * 2 * freq + phase + b) * amp
        );
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }
  },

  halftone(ctx, w, h, r) {
    fillGradient(ctx, w, h, [r.colors[0], r.colors[1] ?? r.colors[0]], r.angle);
    const dot = r.colors[2] ?? '#ffffff';
    const s = 26 * r.scale;
    ctx.fillStyle = dot;
    for (let y = 0, row = 0; y < h + s; y += s * 0.866, row++) {
      for (let x = row % 2 ? s / 2 : 0; x < w + s; x += s) {
        const t = y / h;
        const rad = s * 0.5 * Math.max(0, 1 - t * 1.05);
        if (rad < 0.6) continue;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  galaxy(ctx, w, h, r) {
    const rnd = mulberry32(r.seed);
    fillGradient(ctx, w, h, [r.colors[0], mix(r.colors[0], '#000000', 0.6)], 60);
    const clouds = r.colors.slice(1);
    for (let i = 0; i < 26; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const rad = (90 + rnd() * 240) * r.scale;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      const c = clouds[i % clouds.length];
      g.addColorStop(0, rgba(c, 0.5));
      g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 900; i++) {
      const size = rnd() < 0.94 ? rnd() * 1.4 + 0.3 : rnd() * 2.6 + 1.2;
      ctx.fillStyle = `rgba(255,255,255,${0.35 + rnd() * 0.65})`;
      ctx.beginPath();
      ctx.arc(rnd() * w, rnd() * h, size, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  checker(ctx, w, h, r) {
    const [a, b] = r.colors;
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, w, h);
    const s = 40 * r.scale;
    for (let y = 0, row = 0; y < h; y += s, row++) {
      // Squares shrink toward the tail so the checkers fade out.
      const k = Math.max(0, 1 - (y / h) * 1.15);
      if (k <= 0.02) continue;
      const size = s * (0.25 + 0.75 * k);
      ctx.fillStyle = b ?? '#ffffff';
      for (let x = row % 2 ? s : 0; x < w; x += s * 2) {
        ctx.fillRect(x + (s - size) / 2, y + (s - size) / 2, size, size);
      }
    }
  },

  topo(ctx, w, h, r) {
    const rnd = mulberry32(r.seed);
    fillGradient(ctx, w, h, [r.colors[0], r.colors[1] ?? r.colors[0]], 115);
    ctx.strokeStyle = r.colors[2] ?? '#ffffff';
    ctx.lineWidth = 2 * r.scale;
    const centers = Array.from({ length: 7 }, () => ({
      x: rnd() * w,
      y: rnd() * h,
      f: 0.7 + rnd() * 0.9,
      p: rnd() * 6,
    }));
    for (const c of centers) {
      for (let k = 1; k < 9; k++) {
        const base = k * 26 * r.scale * c.f;
        ctx.globalAlpha = 0.75 - k * 0.06;
        ctx.beginPath();
        for (let a = 0; a <= 64; a++) {
          const ang = (a / 64) * Math.PI * 2;
          const rr =
            base *
            (1 + 0.16 * Math.sin(ang * 3 + c.p) + 0.1 * Math.cos(ang * 5 - c.p));
          const x = c.x + Math.cos(ang) * rr;
          const y = c.y + Math.sin(ang) * rr;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  },

  splatter(ctx, w, h, r) {
    const rnd = mulberry32(r.seed);
    ctx.fillStyle = r.colors[0];
    ctx.fillRect(0, 0, w, h);
    const inks = r.colors.slice(1);
    for (let i = 0; i < 46; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const rad = (16 + rnd() * 70) * r.scale;
      ctx.fillStyle = inks[i % inks.length];
      blob(ctx, rnd, x, y, rad, 0.3);
      const drops = 6 + Math.floor(rnd() * 14);
      for (let d = 0; d < drops; d++) {
        const a = rnd() * Math.PI * 2;
        const dist = rad * (1.1 + rnd() * 1.9);
        ctx.beginPath();
        ctx.arc(
          x + Math.cos(a) * dist,
          y + Math.sin(a) * dist,
          rad * (0.04 + rnd() * 0.16),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  },

  zebra(ctx, w, h, r) {
    const rnd = mulberry32(r.seed);
    ctx.fillStyle = r.colors[0];
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = r.colors[1] ?? '#000000';
    const band = 54 * r.scale;
    const p1 = rnd() * 6;
    const p2 = rnd() * 6;
    for (let y = -band; y < h + band; y += band * 2) {
      ctx.beginPath();
      const top: [number, number][] = [];
      const bottom: [number, number][] = [];
      for (let x = -20; x <= w + 20; x += 12) {
        const off =
          Math.sin(x * 0.011 + y * 0.004 + p1) * band * 0.9 +
          Math.sin(x * 0.027 + p2) * band * 0.35;
        const thick = band * (0.55 + 0.4 * Math.sin(x * 0.017 + y * 0.01));
        top.push([x, y + off]);
        bottom.push([x, y + off + thick]);
      }
      top.forEach(([x, yy], i) => (i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy)));
      bottom.reverse().forEach(([x, yy]) => ctx.lineTo(x, yy));
      ctx.closePath();
      ctx.fill();
    }
  },

  hex(ctx, w, h, r) {
    const rnd = mulberry32(r.seed);
    ctx.fillStyle = r.colors[0];
    ctx.fillRect(0, 0, w, h);
    const s = 34 * r.scale;
    const hh = s * Math.sqrt(3);
    const fills = r.colors.slice(1);
    for (let row = -1; row * (hh / 2) < h + hh; row++) {
      for (let col = -1; col * s * 3 < w + s * 3; col++) {
        const cx = col * s * 3 + (row % 2 ? s * 1.5 : 0);
        const cy = row * (hh / 2);
        const pick = rnd();
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k;
          const x = cx + Math.cos(a) * (s - 2.5);
          const y = cy + Math.sin(a) * (s - 2.5);
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = rgba(
          fills[Math.floor(pick * fills.length) % fills.length],
          0.25 + rnd() * 0.75
        );
        ctx.fill();
      }
    }
  },

  sunset(ctx, w, h, r) {
    fillGradient(ctx, w, h, r.colors.slice(0, 3), 90);
    const sun = r.colors[3] ?? '#ffd166';
    const line = r.colors[4] ?? r.colors[0];
    for (const cx of [w * 0.14, w * 0.5, w * 0.86]) {
      const cy = h * 0.46;
      const rad = w * 0.13 * r.scale;
      const g = ctx.createLinearGradient(0, cy - rad, 0, cy + rad);
      g.addColorStop(0, sun);
      g.addColorStop(1, mix(sun, r.colors[1] ?? sun, 0.75));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = line;
      for (let k = 0; k < 6; k++) {
        const y = cy + rad * (0.12 + k * 0.15);
        ctx.fillRect(cx - rad, y, rad * 2, rad * (0.03 + k * 0.012));
      }
    }
    ctx.strokeStyle = rgba(sun, 0.55);
    ctx.lineWidth = 2;
    for (let k = 0; k < 14; k++) {
      const y = h * 0.62 + Math.pow(k / 14, 1.8) * h * 0.38;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let k = -12; k <= 12; k++) {
      ctx.beginPath();
      ctx.moveTo(w / 2 + k * w * 0.02, h * 0.62);
      ctx.lineTo(w / 2 + k * w * 0.12, h);
      ctx.stroke();
    }
  },

  mosaic(ctx, w, h, r) {
    const rnd = mulberry32(r.seed);
    const s = 32 * r.scale;
    for (let y = 0; y < h; y += s) {
      for (let x = 0; x < w; x += s) {
        const t = Math.min(
          0.999,
          Math.max(0, y / h + (rnd() - 0.5) * 0.45)
        );
        const seg = t * (r.colors.length - 1);
        const i = Math.floor(seg);
        ctx.fillStyle = mix(
          r.colors[i],
          r.colors[i + 1] ?? r.colors[i],
          rnd() < 0.5 ? 0 : seg - i
        );
        ctx.fillRect(x, y, s + 0.5, s + 0.5);
      }
    }
  },

  circuit(ctx, w, h, r) {
    const rnd = mulberry32(r.seed);
    fillGradient(ctx, w, h, [r.colors[0], mix(r.colors[0], '#000000', 0.5)], 90);
    const grid = 28 * r.scale;
    const inks = r.colors.slice(1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < 150; i++) {
      let x = Math.round((rnd() * w) / grid) * grid;
      let y = Math.round((rnd() * h) / grid) * grid;
      const col = inks[i % inks.length];
      ctx.strokeStyle = col;
      ctx.fillStyle = col;
      ctx.lineWidth = rnd() < 0.2 ? 4 : 2;
      ctx.shadowColor = col;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      let dir = Math.floor(rnd() * 4);
      const steps = 3 + Math.floor(rnd() * 6);
      for (let k = 0; k < steps; k++) {
        const len = grid * (1 + Math.floor(rnd() * 4));
        x += [1, 0, -1, 0][dir] * len;
        y += [0, 1, 0, -1][dir] * len;
        ctx.lineTo(x, y);
        dir = (dir + (rnd() < 0.5 ? 1 : 3)) % 4;
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  },

  spots(ctx, w, h, r) {
    const rnd = mulberry32(r.seed);
    fillGradient(ctx, w, h, [r.colors[0], mix(r.colors[0], '#000000', 0.18)], 90);
    const ring = r.colors[1] ?? '#000000';
    const core = r.colors[2] ?? mix(r.colors[0], '#000000', 0.3);
    const step = 74 * r.scale;
    for (let y = 0; y < h + step; y += step) {
      for (let x = 0; x < w + step; x += step) {
        const cx = x + (rnd() - 0.5) * step * 0.8;
        const cy = y + (rnd() - 0.5) * step * 0.8;
        const rad = step * (0.2 + rnd() * 0.16);
        ctx.fillStyle = ring;
        blob(ctx, rnd, cx, cy, rad, 0.35);
        ctx.fillStyle = core;
        blob(ctx, rnd, cx + rad * 0.08, cy, rad * 0.55, 0.3);
      }
    }
  },
};

export function drawPattern(
  ctx: Ctx,
  width: number,
  height: number,
  recipe: PatternRecipe
) {
  const full: Required<PatternRecipe> = {
    seed: 1,
    angle: 90,
    scale: 1,
    ...recipe,
  };
  ctx.save();
  painters[full.kind](ctx, width, height, full);
  ctx.restore();
}

/** Renders a recipe to a detached canvas (browser only). */
export function patternCanvas(
  recipe: PatternRecipe,
  width = 1024,
  height = 1024
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawPattern(canvas.getContext('2d')!, width, height, recipe);
  return canvas;
}