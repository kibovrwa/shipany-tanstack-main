import { WRAP_VEHICLES } from '../../src/config/wrap';
import { WRAP_DESIGNS } from '../../src/config/wrap-gallery';
import { createCarScene } from '../../src/lib/wrap/car-scene';
import { drawPattern, type PatternRecipe } from '../../src/lib/wrap/patterns';

interface Job {
  vehicle: string;
  recipe?: PatternRecipe;
  width: number;
  height: number;
  azimuth?: number;
  elevation?: number;
  distance?: number;
  background?: [string, string];
  paint?: string;
  quality?: number;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function renderCar(job: Job): Promise<string> {
  const vehicle = WRAP_VEHICLES.find((v) => v.slug === job.vehicle)!;
  const gl = document.createElement('canvas');
  gl.width = job.width;
  gl.height = job.height;
  gl.style.width = `${job.width}px`;
  gl.style.height = `${job.height}px`;
  document.body.appendChild(gl);
  const scene = createCarScene(gl, {
    body: vehicle.body,
    zones: vehicle.zones,
    interactive: false,
    azimuth: job.azimuth,
    elevation: job.elevation,
    distance: job.distance,
    paint: job.paint,
    pixelRatio: 1,
    preserveDrawingBuffer: true,
  });
  if (job.recipe) {
    const wrap = document.createElement('canvas');
    wrap.width = vehicle.width;
    wrap.height = vehicle.height;
    drawPattern(wrap.getContext('2d')!, wrap.width, wrap.height, job.recipe);
    scene.setWrap(wrap);
  }
  scene.render();
  await wait(30);
  scene.render();
  const out = document.createElement('canvas');
  out.width = job.width;
  out.height = job.height;
  const ctx = out.getContext('2d')!;
  const [c0, c1] = job.background ?? ['#2b2b2e', '#141415'];
  const bg = ctx.createRadialGradient(
    job.width / 2,
    job.height * 0.55,
    0,
    job.width / 2,
    job.height * 0.55,
    Math.max(job.width, job.height) * 0.75
  );
  bg.addColorStop(0, c0);
  bg.addColorStop(1, c1);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, job.width, job.height);
  ctx.drawImage(gl, 0, 0);
  const url = out.toDataURL('image/webp', job.quality ?? 0.82);
  scene.dispose();
  gl.remove();
  return url;
}

Object.assign(window, {
  wrapRender: {
    renderCar,
    vehicles: WRAP_VEHICLES,
    designs: WRAP_DESIGNS,
  },
});