import type { WrapVehicle, ZoneRect } from '@/config/wrap';

export interface ZoneAnchor {
  /** Centre in template pixels. */
  x: number;
  y: number;
  /** Clockwise rotation (radians) that makes artwork upright on the car. */
  rotation: number;
  /** Largest upright square that fits the panel, in template pixels. */
  size: number;
}

export type ZoneName = 'hood' | 'trunk' | 'sideA' | 'sideB' | 'front' | 'rear';

function centre(r: ZoneRect, w: number, h: number) {
  return { x: ((r[0] + r[2]) / 2) * w, y: ((r[1] + r[3]) / 2) * h };
}

/**
 * Where to put artwork so it sits upright on a body panel. `sideA` is the
 * strip stored in the vehicle's zones, `sideB` is its mirror image.
 */
export function zoneAnchor(
  vehicle: Pick<WrapVehicle, 'zones' | 'width' | 'height'>,
  zone: ZoneName
): ZoneAnchor {
  const { zones, width: w, height: h } = vehicle;
  const vertical = zones.axis === 'vertical';
  const span = (r: ZoneRect) =>
    Math.min((r[2] - r[0]) * w, (r[3] - r[1]) * h) * 0.8;

  if (zone === 'sideA' || zone === 'sideB') {
    const r = zones.left;
    const c = centre(r, w, h);
    const mirrored = zone === 'sideB';
    if (vertical) {
      return {
        x: mirrored ? w - c.x : c.x,
        y: c.y,
        rotation: mirrored ? -Math.PI / 2 : Math.PI / 2,
        size: span(r),
      };
    }
    return {
      x: c.x,
      y: mirrored ? h - c.y : c.y,
      rotation: mirrored ? 0 : Math.PI,
      size: span(r),
    };
  }

  const r = zones[zone];
  const c = centre(r, w, h);
  const flip = zone === 'rear' ? Math.PI : 0;
  return {
    ...c,
    rotation: (vertical ? 0 : -Math.PI / 2) + flip,
    size: span(r),
  };
}