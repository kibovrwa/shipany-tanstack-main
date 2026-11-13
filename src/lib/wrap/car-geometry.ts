import * as THREE from 'three';

import type { WrapBodyType, WrapZones, ZoneRect } from '@/config/wrap';

/**
 * Original procedural vehicle bodies for the 3D preview. Each body is a loft
 * of cross-sections along the car's length, so no third-party mesh or CAD
 * data is involved. The UV layout follows the panel zones of the wrap
 * template (hood, sides, bumpers, trunk), which makes a design land on the
 * matching panel of the preview.
 *
 * Axes: +X forward, +Y up, +Z to the car's right. Units are metres.
 */

type Curve = [number, number][];

export interface BodySpec {
  length: number;
  faceted: boolean;
  top: Curve;
  belt: Curve;
  bottom: Curve;
  half: Curve;
  roofHalf: Curve;
  /** Stations (0 = nose, 1 = tail) covered by windshield / roof glass. */
  glassTop: [number, number];
  glassSide: [number, number];
  cowl: number;
  deck: number;
  frontCap: number;
  rearCap: number;
  wheelRadius: number;
  /** Axle positions measured back from the nose, in metres. */
  axles: [number, number];
  track: number;
  paint: { metalness: number; roughness: number; clearcoat: number };
}

const CROSSOVER: BodySpec = {
  length: 4.79,
  faceted: false,
  top: [
    [0, 0.6],
    [0.025, 0.76],
    [0.1, 0.9],
    [0.25, 1.02],
    [0.4, 1.5],
    [0.5, 1.61],
    [0.63, 1.6],
    [0.8, 1.44],
    [0.9, 1.2],
    [0.965, 1.04],
    [1, 0.86],
  ],
  belt: [
    [0, 0.56],
    [0.03, 0.72],
    [0.1, 0.86],
    [0.25, 0.98],
    [0.5, 1.03],
    [0.8, 1.08],
    [0.93, 1.05],
    [1, 0.84],
  ],
  bottom: [
    [0, 0.36],
    [0.03, 0.24],
    [0.12, 0.19],
    [0.5, 0.17],
    [0.88, 0.2],
    [0.97, 0.3],
    [1, 0.44],
  ],
  half: [
    [0, 0.62],
    [0.02, 0.82],
    [0.08, 0.93],
    [0.3, 0.965],
    [0.6, 0.965],
    [0.9, 0.94],
    [0.975, 0.84],
    [1, 0.64],
  ],
  roofHalf: [
    [0, 0.52],
    [0.1, 0.8],
    [0.25, 0.8],
    [0.4, 0.62],
    [0.5, 0.59],
    [0.7, 0.58],
    [0.9, 0.62],
    [0.965, 0.72],
    [1, 0.55],
  ],
  glassTop: [0.265, 0.9],
  glassSide: [0.31, 0.86],
  cowl: 0.25,
  deck: 0.9,
  frontCap: 0.035,
  rearCap: 0.965,
  wheelRadius: 0.36,
  axles: [0.9, 3.79],
  track: 0.82,
  paint: { metalness: 0.35, roughness: 0.32, clearcoat: 1 },
};

const SEDAN: BodySpec = {
  ...CROSSOVER,
  length: 4.72,
  top: [
    [0, 0.55],
    [0.025, 0.68],
    [0.1, 0.79],
    [0.27, 0.9],
    [0.42, 1.34],
    [0.52, 1.44],
    [0.63, 1.42],
    [0.8, 1.2],
    [0.89, 1.01],
    [0.965, 0.95],
    [1, 0.8],
  ],
  belt: [
    [0, 0.52],
    [0.03, 0.65],
    [0.1, 0.76],
    [0.27, 0.87],
    [0.5, 0.92],
    [0.8, 0.96],
    [0.93, 0.95],
    [1, 0.78],
  ],
  bottom: [
    [0, 0.33],
    [0.03, 0.21],
    [0.12, 0.16],
    [0.5, 0.14],
    [0.88, 0.17],
    [0.97, 0.27],
    [1, 0.4],
  ],
  half: [
    [0, 0.6],
    [0.02, 0.78],
    [0.08, 0.88],
    [0.3, 0.925],
    [0.6, 0.925],
    [0.9, 0.9],
    [0.975, 0.8],
    [1, 0.62],
  ],
  roofHalf: [
    [0, 0.5],
    [0.1, 0.76],
    [0.27, 0.77],
    [0.42, 0.6],
    [0.52, 0.56],
    [0.7, 0.56],
    [0.89, 0.66],
    [0.965, 0.7],
    [1, 0.52],
  ],
  glassTop: [0.285, 0.87],
  glassSide: [0.33, 0.83],
  cowl: 0.27,
  deck: 0.89,
  wheelRadius: 0.34,
  axles: [0.86, 3.735],
  track: 0.79,
};

const COUPE: BodySpec = {
  ...SEDAN,
  length: 4.4,
  top: [
    [0, 0.52],
    [0.03, 0.66],
    [0.12, 0.78],
    [0.28, 0.86],
    [0.44, 1.22],
    [0.55, 1.3],
    [0.7, 1.22],
    [0.88, 0.98],
    [0.965, 0.86],
    [1, 0.72],
  ],
  belt: [
    [0, 0.5],
    [0.03, 0.63],
    [0.12, 0.75],
    [0.28, 0.84],
    [0.55, 0.88],
    [0.88, 0.9],
    [1, 0.7],
  ],
  glassTop: [0.3, 0.84],
  glassSide: [0.34, 0.74],
  cowl: 0.28,
  deck: 0.88,
  wheelRadius: 0.35,
  axles: [0.82, 3.5],
};

const ROADSTER: BodySpec = {
  ...COUPE,
  length: 4.3,
  top: [
    [0, 0.46],
    [0.03, 0.58],
    [0.14, 0.7],
    [0.34, 0.78],
    [0.48, 1.1],
    [0.58, 1.15],
    [0.72, 1.06],
    [0.88, 0.9],
    [0.965, 0.82],
    [1, 0.66],
  ],
  belt: [
    [0, 0.44],
    [0.03, 0.55],
    [0.14, 0.67],
    [0.34, 0.76],
    [0.58, 0.8],
    [0.88, 0.84],
    [1, 0.64],
  ],
  bottom: [
    [0, 0.3],
    [0.03, 0.18],
    [0.12, 0.13],
    [0.5, 0.12],
    [0.88, 0.14],
    [0.97, 0.24],
    [1, 0.36],
  ],
  glassTop: [0.36, 0.8],
  glassSide: [0.4, 0.72],
  cowl: 0.34,
  axles: [0.82, 3.42],
};

const TRUCK: BodySpec = {
  length: 5.68,
  faceted: true,
  top: [
    [0, 0.96],
    [0.012, 1.04],
    [0.23, 1.16],
    [0.42, 1.8],
    [0.985, 1.22],
    [1, 1.1],
  ],
  belt: [
    [0, 0.94],
    [0.012, 1.02],
    [0.23, 1.12],
    [0.42, 1.16],
    [0.985, 1.2],
    [1, 1.08],
  ],
  bottom: [
    [0, 0.56],
    [0.02, 0.44],
    [0.5, 0.42],
    [0.98, 0.44],
    [1, 0.58],
  ],
  half: [
    [0, 0.96],
    [0.012, 1.01],
    [0.5, 1.015],
    [0.985, 1.01],
    [1, 0.96],
  ],
  roofHalf: [
    [0, 0.9],
    [0.23, 0.9],
    [0.42, 0.7],
    [0.6, 0.78],
    [0.985, 0.92],
    [1, 0.88],
  ],
  glassTop: [0.245, 0.52],
  glassSide: [0.3, 0.56],
  cowl: 0.23,
  deck: 0.56,
  frontCap: 0.012,
  rearCap: 0.985,
  wheelRadius: 0.44,
  axles: [1.02, 4.65],
  track: 0.87,
  paint: { metalness: 0.9, roughness: 0.36, clearcoat: 0 },
};

const SEMI: BodySpec = {
  length: 7.2,
  faceted: false,
  top: [
    [0, 1.6],
    [0.015, 2.1],
    [0.08, 3.2],
    [0.18, 3.85],
    [0.38, 3.9],
    [0.42, 3.4],
    [0.46, 1.25],
    [0.985, 1.2],
    [1, 1.05],
  ],
  belt: [
    [0, 1.5],
    [0.015, 1.9],
    [0.08, 2.1],
    [0.38, 2.1],
    [0.44, 1.5],
    [0.47, 1.18],
    [0.985, 1.14],
    [1, 1.0],
  ],
  bottom: [
    [0, 0.6],
    [0.02, 0.46],
    [0.5, 0.5],
    [0.98, 0.6],
    [1, 0.7],
  ],
  half: [
    [0, 0.9],
    [0.02, 1.2],
    [0.4, 1.25],
    [0.48, 1.2],
    [0.985, 1.18],
    [1, 1.05],
  ],
  roofHalf: [
    [0, 0.6],
    [0.08, 0.9],
    [0.38, 1.05],
    [0.46, 1.1],
    [1, 1.0],
  ],
  glassTop: [0.03, 0.15],
  glassSide: [0.05, 0.3],
  cowl: 0.03,
  deck: 0.46,
  frontCap: 0.015,
  rearCap: 0.985,
  wheelRadius: 0.52,
  axles: [1.25, 6.1],
  track: 0.98,
  paint: { metalness: 0.3, roughness: 0.34, clearcoat: 1 },
};

export const BODY_SPECS: Record<WrapBodyType, BodySpec> = {
  crossover: CROSSOVER,
  sedan: SEDAN,
  coupe: COUPE,
  roadster: ROADSTER,
  truck: TRUCK,
  semi: SEMI,
};

function sample(curve: Curve, t: number, smooth: boolean): number {
  let i = 0;
  while (i < curve.length - 2 && t > curve[i + 1][0]) i++;
  const [t0, v0] = curve[i];
  const [t1, v1] = curve[i + 1];
  const dt = t1 - t0;
  const u = Math.min(1, Math.max(0, (t - t0) / dt));
  if (!smooth) return v0 + (v1 - v0) * u;
  const prev = curve[i - 1] ?? curve[i];
  const next = curve[i + 2] ?? curve[i + 1];
  const m0 = (v1 - prev[1]) / (t1 - prev[0]);
  const m1 = (next[1] - v0) / (next[0] - t0);
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * v0 +
    (u3 - 2 * u2 + u) * dt * m0 +
    (-2 * u3 + 3 * u2) * v1 +
    (u3 - u2) * dt * m1
  );
}

const SEG = 4;
const KEYS = 8;
const RING = (KEYS - 1) * SEG + 1;

/** Half cross-section from the roof centre line (z = 0) down to the keel. */
function halfSection(spec: BodySpec, t: number): [number, number][] {
  const smooth = !spec.faceted;
  const top = sample(spec.top, t, smooth);
  const belt = Math.min(sample(spec.belt, t, smooth), top - 0.015);
  const bottom = sample(spec.bottom, t, smooth);
  const w = sample(spec.half, t, smooth);
  const wr = Math.min(sample(spec.roofHalf, t, smooth), w * 0.97);
  const crown = spec.faceted ? 0 : Math.min(0.05, (top - belt) * 0.5);
  const side = belt - bottom;
  const keys: [number, number][] = spec.faceted
    ? [
        [0, top],
        [wr * 0.9, top],
        [wr, top],
        [w, belt],
        [w, bottom + side * 0.35],
        [w * 0.94, bottom],
        [w * 0.9, bottom],
        [0, bottom],
      ]
    : [
        [0, top],
        [wr * 0.88, top - crown * 0.25],
        [wr, top - crown],
        [w * 0.975, belt],
        [w, bottom + side * 0.5],
        [w * 0.955, bottom + side * 0.06],
        [w * 0.82, bottom],
        [0, bottom],
      ];
  const pts: [number, number][] = [];
  for (let k = 0; k < KEYS - 1; k++) {
    const p0 = keys[Math.max(0, k - 1)];
    const p1 = keys[k];
    const p2 = keys[k + 1];
    const p3 = keys[Math.min(KEYS - 1, k + 2)];
    for (let s = 0; s < SEG; s++) {
      const u = s / SEG;
      if (spec.faceted || k === KEYS - 2) {
        pts.push([p1[0] + (p2[0] - p1[0]) * u, p1[1] + (p2[1] - p1[1]) * u]);
        continue;
      }
      const u2 = u * u;
      const u3 = u2 * u;
      const cr = (a: number, b: number, c: number, d: number) =>
        0.5 *
        (2 * b +
          (-a + c) * u +
          (2 * a - 5 * b + 4 * c - d) * u2 +
          (-a + 3 * b - 3 * c + d) * u3);
      pts.push([
        Math.max(0, cr(p0[0], p1[0], p2[0], p3[0])),
        cr(p0[1], p1[1], p2[1], p3[1]),
      ]);
    }
  }
  pts.push(keys[KEYS - 1]);
  return pts;
}

function stations(spec: BodySpec): number[] {
  const out = [0, 0.004, spec.frontCap * 0.4, spec.frontCap];
  const step = 0.0125;
  for (let t = spec.frontCap + step; t < spec.rearCap - step * 0.5; t += step) {
    out.push(t);
  }
  out.push(spec.rearCap, 1 - (1 - spec.rearCap) * 0.4, 0.996, 1);
  return [...new Set(out.map((v) => +v.toFixed(5)))].sort((a, b) => a - b);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

interface Builder {
  pos: number[];
  nor: number[];
  uv: number[];
}

const builder = (): Builder => ({ pos: [], nor: [], uv: [] });

function toGeometry(b: Builder): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
  return g;
}

export interface CarGeometry {
  spec: BodySpec;
  body: THREE.BufferGeometry;
  glass: THREE.BufferGeometry;
  under: THREE.BufferGeometry;
  /** Wheel hub centres: front-left, front-right, rear-left, rear-right. */
  wheels: THREE.Vector3[];
  /** Arch cut-outs: x of each axle, hub height, radius, inner |z| limit. */
  arches: { front: number; rear: number; y: number; radius: number; inner: number };
  size: { length: number; width: number; height: number };
}

export function buildCarGeometry(
  bodyType: WrapBodyType,
  zones: WrapZones
): CarGeometry {
  const spec = BODY_SPECS[bodyType];
  const smooth = !spec.faceted;
  const L = spec.length;
  const ts = stations(spec);
  const rings = ts.map((t) => halfSection(spec, t));
  const xs = ts.map((t) => L / 2 - t * L);

  let wMax = 0;
  let yMin = Infinity;
  let yBelt = 0;
  let yTop = 0;
  ts.forEach((t, i) => {
    for (const [z, y] of rings[i]) {
      wMax = Math.max(wMax, z);
      yMin = Math.min(yMin, y);
      yTop = Math.max(yTop, y);
    }
    yBelt = Math.max(yBelt, sample(spec.belt, t, smooth));
  });
  const ySideTop = yBelt + 0.12;

  const vertical = zones.axis === 'vertical';
  const rect = (r: ZoneRect, a: number, b: number): [number, number] => [
    lerp(r[0], r[2], a),
    lerp(r[1], r[3], b),
  ];
  const lateral = (z: number) => clamp01(0.5 + z / (2 * wMax));

  type Zone = 'front' | 'rear' | 'top' | 'side';
  const uvOf = (
    zone: Zone,
    x: number,
    y: number,
    z: number,
    t: number,
    sideSign: number
  ): [number, number] => {
    let u: number;
    let v: number;
    if (zone === 'top') {
      let r: ZoneRect;
      let k: number;
      if (t <= spec.cowl) {
        r = zones.hood;
        k = clamp01((t - spec.frontCap) / (spec.cowl - spec.frontCap));
      } else if (t >= spec.deck) {
        r = zones.trunk;
        k = clamp01((t - spec.deck) / (spec.rearCap - spec.deck));
      } else {
        // Glass roof: not a wrap panel, bridged between hood and trunk.
        const k2 = (t - spec.cowl) / (spec.deck - spec.cowl);
        r = vertical
          ? [zones.hood[0], zones.hood[3], zones.hood[2], zones.trunk[1]]
          : [zones.hood[2], zones.hood[1], zones.trunk[0], zones.hood[3]];
        k = clamp01(k2);
      }
      [u, v] = vertical ? rect(r, lateral(z), k) : rect(r, k, lateral(z));
    } else if (zone === 'side') {
      const h = clamp01((y - yMin) / (ySideTop - yMin));
      const r = zones.left;
      if (vertical) {
        [u, v] = rect(r, h, t);
        if (sideSign > 0) u = 1 - u;
      } else {
        [u, v] = rect(r, t, h);
        if (sideSign > 0) v = 1 - v;
      }
    } else {
      const front = zone === 'front';
      const r = front ? zones.front : zones.rear;
      const h = clamp01((y - yMin) / (ySideTop - yMin));
      if (vertical) [u, v] = rect(r, lateral(z), front ? h : 1 - h);
      else [u, v] = rect(r, front ? h : 1 - h, lateral(z));
    }
    return [u, 1 - v];
  };

  const body = builder();
  const glass = builder();
  const under = builder();

  for (const sideSign of [1, -1]) {
    const P = (i: number, j: number): THREE.Vector3 =>
      new THREE.Vector3(xs[i], rings[i][j][1], rings[i][j][0] * sideSign);

    const normals: THREE.Vector3[][] = ts.map((_, i) =>
      rings[i].map((__, j) => {
        const a = P(Math.min(i + 1, ts.length - 1), j).sub(
          P(Math.max(i - 1, 0), j)
        );
        const b = P(i, Math.min(j + 1, RING - 1)).sub(P(i, Math.max(j - 1, 0)));
        const n = new THREE.Vector3().crossVectors(a, b);
        if (sideSign < 0) n.negate();
        if (rings[i][j][0] < 1e-4) n.z = 0;
        if (n.lengthSq() < 1e-10) n.set(0, j < RING / 2 ? 1 : -1, 0);
        return n.normalize();
      })
    );

    for (let i = 0; i < ts.length - 1; i++) {
      const tMid = (ts[i] + ts[i + 1]) / 2;
      const top = sample(spec.top, tMid, smooth);
      const belt = sample(spec.belt, tMid, smooth);
      const greenhouse = top - belt > 0.15;
      for (let j = 0; j < RING - 1; j++) {
        const seg = Math.floor(j / SEG);
        let target: Builder = body;
        let zone: Zone = seg <= 1 ? 'top' : 'side';
        if (seg === 6) target = under;
        else if (tMid < spec.frontCap) zone = 'front';
        else if (tMid > spec.rearCap) zone = 'rear';
        else if (
          seg === 0 &&
          greenhouse &&
          tMid > spec.glassTop[0] &&
          tMid < spec.glassTop[1]
        )
          target = glass;
        else if (
          seg === 2 &&
          greenhouse &&
          tMid > spec.glassSide[0] &&
          tMid < spec.glassSide[1]
        )
          target = glass;

        const quad: [number, number][] = [
          [i, j],
          [i + 1, j],
          [i + 1, j + 1],
          [i, j + 1],
        ];
        const order = sideSign > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2];
        let flat: THREE.Vector3 | null = null;
        if (spec.faceted) {
          const a = P(i, j);
          flat = new THREE.Vector3()
            .crossVectors(P(i + 1, j).sub(a), P(i, j + 1).sub(a))
            .multiplyScalar(sideSign)
            .normalize();
          if (flat.lengthSq() < 0.5) flat = null;
        }
        for (const k of order) {
          const [qi, qj] = quad[k];
          const p = P(qi, qj);
          const n = flat ?? normals[qi][qj];
          target.pos.push(p.x, p.y, p.z);
          target.nor.push(n.x, n.y, n.z);
          if (target === body) {
            const [u, v] = uvOf(zone, p.x, p.y, p.z, ts[qi], sideSign);
            target.uv.push(u, v);
          } else target.uv.push(0, 0);
        }
      }
    }

    // End caps close the nose and the tail.
    for (const end of [0, ts.length - 1]) {
      const front = end === 0;
      const ring = rings[end];
      const cy = (ring[0][1] + ring[RING - 1][1]) / 2;
      const centre = new THREE.Vector3(xs[end], cy, 0);
      const n = new THREE.Vector3(front ? 1 : -1, 0, 0);
      for (let j = 0; j < RING - 1; j++) {
        const a = P(end, j);
        const b = P(end, j + 1);
        const tri = front === sideSign > 0 ? [centre, a, b] : [centre, b, a];
        for (const p of tri) {
          body.pos.push(p.x, p.y, p.z);
          const [u, v] = uvOf(
            front ? 'front' : 'rear',
            p.x,
            p.y,
            p.z,
            ts[end],
            sideSign
          );
          body.uv.push(u, v);
        }
      }
    }
  }

  const r = spec.wheelRadius;
  const frontX = L / 2 - spec.axles[0];
  const rearX = L / 2 - spec.axles[1];
  return {
    spec,
    body: toGeometry(body),
    glass: toGeometry(glass),
    under: toGeometry(under),
    wheels: [
      new THREE.Vector3(frontX, r, -spec.track),
      new THREE.Vector3(frontX, r, spec.track),
      new THREE.Vector3(rearX, r, -spec.track),
      new THREE.Vector3(rearX, r, spec.track),
    ],
    arches: {
      front: frontX,
      rear: rearX,
      y: r,
      radius: r * 1.17,
      inner: wMax * 0.5,
    },
    size: { length: L, width: wMax * 2, height: yTop },
  };
}