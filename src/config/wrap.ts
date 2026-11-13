/**
 * Wrap designer configuration: supported vehicles, their template layout and
 * the product constants shared by the editor, the gallery and the AI routes.
 *
 * Template artwork is NOT shipped in this repo. The official per-vehicle
 * templates are published by Tesla at github.com/teslamotors/custom-wraps
 * without a license file, so they are loaded at runtime from
 * `WRAP_TEMPLATE_BASE_URL` (set `VITE_WRAP_TEMPLATE_BASE_URL` to self-host
 * them once you have confirmed you may redistribute them). When a template
 * cannot be loaded the editor falls back to a generated panel guide.
 */

export type WrapBodyType =
  | 'crossover'
  | 'sedan'
  | 'truck'
  | 'coupe'
  | 'roadster'
  | 'semi';

/** Normalised rectangle in template space: [x0, y0, x1, y1], y pointing down. */
export type ZoneRect = [number, number, number, number];

export interface WrapZones {
  /** `vertical`: car length runs top to bottom; `horizontal`: left to right. */
  axis: 'vertical' | 'horizontal';
  front: ZoneRect;
  hood: ZoneRect;
  trunk: ZoneRect;
  rear: ZoneRect;
  /** Driver-side panel strip. The other side is its mirror image. */
  left: ZoneRect;
}

export interface WrapVehicle {
  slug: string;
  name: string;
  /** Trim or model-year line shown under the name. */
  variant?: string;
  body: WrapBodyType;
  /** Folder name in the official template repository. */
  template?: string;
  width: number;
  height: number;
  zones: WrapZones;
  /** Editable in the designer. View-only vehicles get an info page. */
  editable: boolean;
}

const env = import.meta.env as Record<string, string | undefined>;

export const WRAP_TEMPLATE_BASE_URL = (
  env.VITE_WRAP_TEMPLATE_BASE_URL ||
  'https://raw.githubusercontent.com/teslamotors/custom-wraps/master'
).replace(/\/+$/, '');

export const WRAP_TEMPLATE_SOURCE_URL =
  'https://github.com/teslamotors/custom-wraps';

export function wrapTemplateUrl(vehicle: WrapVehicle): string | null {
  return vehicle.template
    ? `${WRAP_TEMPLATE_BASE_URL}/${vehicle.template}/template.png`
    : null;
}

/** Credits charged for one AI wrap generation. */
export const WRAP_AI_CREDITS = 10;
/** Limits Tesla documents for Paint Shop wrap files. */
export const WRAP_PNG_LIMITS = {
  minSize: 512,
  maxSize: 1024,
  maxBytes: 1024 * 1024,
  maxNameLength: 30,
} as const;

export const WRAP_DEFAULT_VEHICLE = 'modely-2025-premium';
/** Lifetime spend (USD cents) on credit packs that unlocks membership. */
export const WRAP_MEMBERSHIP_SPEND_CENTS = 1900;

const Y_2025: WrapZones = {
  axis: 'vertical',
  front: [0.225, 0.006, 0.77, 0.12],
  hood: [0.367, 0.107, 0.629, 0.332],
  trunk: [0.348, 0.852, 0.648, 0.906],
  rear: [0.387, 0.918, 0.617, 0.992],
  left: [0.055, 0.113, 0.324, 0.99],
};

const M3_2024: WrapZones = {
  axis: 'vertical',
  front: [0.235, 0.023, 0.77, 0.152],
  hood: [0.36, 0.156, 0.645, 0.395],
  trunk: [0.355, 0.59, 0.648, 0.762],
  rear: [0.25, 0.828, 0.75, 0.988],
  left: [0.012, 0.035, 0.26, 0.938],
};

const S_2021: WrapZones = {
  axis: 'vertical',
  front: [0.262, 0.016, 0.738, 0.141],
  hood: [0.367, 0.125, 0.633, 0.363],
  trunk: [0.36, 0.64, 0.64, 0.836],
  rear: [0.277, 0.89, 0.723, 0.996],
  left: [0.074, 0.094, 0.293, 0.863],
};

const GENERIC: WrapZones = Y_2025;

export const WRAP_VEHICLES: WrapVehicle[] = [
  {
    slug: 'cybertruck',
    name: 'Cybertruck',
    body: 'truck',
    template: 'cybertruck',
    width: 1024,
    height: 768,
    zones: {
      axis: 'horizontal',
      front: [0.027, 0.273, 0.09, 0.727],
      hood: [0.125, 0.273, 0.258, 0.727],
      trunk: [0.62, 0.3, 0.88, 0.7],
      rear: [0.898, 0.277, 0.992, 0.723],
      left: [0, 0, 1, 0.332],
    },
    editable: true,
  },
  {
    slug: 'model3',
    name: 'Model 3',
    body: 'sedan',
    template: 'model3',
    width: 1024,
    height: 1024,
    zones: {
      axis: 'vertical',
      front: [0.27, 0.023, 0.73, 0.164],
      hood: [0.36, 0.172, 0.64, 0.39],
      trunk: [0.36, 0.668, 0.64, 0.875],
      rear: [0.266, 0.86, 0.738, 0.996],
      left: [0.012, 0.13, 0.27, 0.973],
    },
    editable: true,
  },
  {
    slug: 'model3-2024-base',
    name: 'Model 3 (2024+)',
    variant: 'Standard & Premium',
    body: 'sedan',
    template: 'model3-2024-base',
    width: 1024,
    height: 1024,
    zones: M3_2024,
    editable: true,
  },
  {
    slug: 'model3-2024-performance',
    name: 'Model 3 (2024+)',
    variant: 'Performance',
    body: 'sedan',
    template: 'model3-2024-performance',
    width: 1024,
    height: 1024,
    zones: M3_2024,
    editable: true,
  },
  {
    slug: 'modely',
    name: 'Model Y',
    body: 'crossover',
    template: 'modely',
    width: 1024,
    height: 1024,
    zones: {
      axis: 'vertical',
      front: [0.246, 0.008, 0.754, 0.145],
      hood: [0.352, 0.148, 0.648, 0.383],
      trunk: [0.297, 0.617, 0.703, 0.918],
      rear: [0.246, 0.867, 0.754, 0.992],
      left: [0.027, 0.008, 0.258, 0.926],
    },
    editable: true,
  },
  {
    slug: 'modely-2025-base',
    name: 'Model Y (2025+)',
    variant: 'Standard',
    body: 'crossover',
    template: 'modely-2025-base',
    width: 1024,
    height: 1024,
    zones: {
      axis: 'vertical',
      front: [0.262, 0.008, 0.73, 0.094],
      hood: [0.367, 0.102, 0.629, 0.297],
      trunk: [0.328, 0.75, 0.676, 0.914],
      rear: [0.398, 0.918, 0.609, 0.996],
      left: [0.137, 0.102, 0.328, 0.941],
    },
    editable: true,
  },
  {
    slug: 'modely-2025-premium',
    name: 'Model Y (2025+)',
    variant: 'Premium',
    body: 'crossover',
    template: 'modely-2025-premium',
    width: 1024,
    height: 1024,
    zones: Y_2025,
    editable: true,
  },
  {
    slug: 'modely-2025-performance',
    name: 'Model Y (2025+)',
    variant: 'Performance',
    body: 'crossover',
    template: 'modely-2025-performance',
    width: 1024,
    height: 1024,
    zones: Y_2025,
    editable: true,
  },
  {
    slug: 'modely-l',
    name: 'Model Y L',
    body: 'crossover',
    template: 'modely-l',
    width: 1024,
    height: 1024,
    zones: {
      axis: 'vertical',
      front: [0.234, 0.023, 0.77, 0.129],
      hood: [0.367, 0.145, 0.637, 0.375],
      trunk: [0.387, 0.891, 0.625, 0.977],
      rear: [0.234, 0.875, 0.766, 0.992],
      left: [0.023, 0.016, 0.277, 0.918],
    },
    editable: true,
  },
  {
    slug: 'models-2021',
    name: 'Model S',
    variant: '2021+',
    body: 'sedan',
    template: 'models-2021',
    width: 1024,
    height: 1024,
    zones: S_2021,
    editable: true,
  },
  {
    slug: 'models-2025-plaid',
    name: 'Model S',
    variant: '2025+ Plaid',
    body: 'sedan',
    template: 'models-2025-plaid',
    width: 1024,
    height: 1024,
    zones: S_2021,
    editable: true,
  },
  {
    slug: 'modelx-2021',
    name: 'Model X',
    variant: '2021+',
    body: 'crossover',
    template: 'modelx-2021',
    width: 1024,
    height: 1024,
    zones: {
      axis: 'vertical',
      front: [0.289, 0.004, 0.711, 0.125],
      hood: [0.367, 0.094, 0.633, 0.277],
      trunk: [0.379, 0.703, 0.621, 0.879],
      rear: [0.297, 0.938, 0.703, 0.992],
      left: [0.168, 0.145, 0.332, 0.844],
    },
    editable: true,
  },
  {
    slug: 'cybercab',
    name: 'Cybercab',
    body: 'coupe',
    width: 1024,
    height: 1024,
    zones: GENERIC,
    editable: false,
  },
  {
    slug: 'roadster',
    name: 'Roadster',
    body: 'roadster',
    width: 1024,
    height: 1024,
    zones: GENERIC,
    editable: false,
  },
  {
    slug: 'semi',
    name: 'Semi',
    body: 'semi',
    width: 1024,
    height: 1024,
    zones: GENERIC,
    editable: false,
  },
];

export const WRAP_EDITABLE_VEHICLES = WRAP_VEHICLES.filter((v) => v.editable);

export function getWrapVehicle(slug: string): WrapVehicle | undefined {
  return WRAP_VEHICLES.find((v) => v.slug === slug);
}

export function wrapVehicleLabel(v: WrapVehicle): string {
  return v.variant ? `${v.name} ${v.variant}` : v.name;
}