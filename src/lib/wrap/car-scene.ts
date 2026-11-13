import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import type { WrapBodyType, WrapZones } from '@/config/wrap';

import { buildCarGeometry, type CarGeometry } from './car-geometry';

export interface CarSceneOptions {
  body: WrapBodyType;
  zones: WrapZones;
  /** Template aspect (width / height); the wrap texture is stretched to it. */
  interactive?: boolean;
  autoRotate?: boolean;
  zoom?: boolean;
  /** Camera azimuth in degrees, 0 = side view, positive = toward the nose. */
  azimuth?: number;
  elevation?: number;
  /** Extra room around the car, 1 = tight fit. */
  distance?: number;
  paint?: string;
  pixelRatio?: number;
  preserveDrawingBuffer?: boolean;
}

export interface CarScene {
  setWrap(source: TexImageSource | null): void;
  /** Call after drawing into the canvas previously passed to `setWrap`. */
  refreshWrap(): void;
  setPaint(color: string): void;
  setAutoRotate(on: boolean): void;
  resetView(): void;
  resize(): void;
  render(): void;
  dispose(): void;
}

function rimTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#0c0c0d';
  g.fillRect(0, 0, 256, 256);
  g.translate(128, 128);
  const metal = g.createRadialGradient(0, 0, 10, 0, 0, 122);
  metal.addColorStop(0, '#d9dce0');
  metal.addColorStop(0.75, '#8d9197');
  metal.addColorStop(1, '#55585d');
  g.fillStyle = metal;
  g.beginPath();
  g.arc(0, 0, 122, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#0c0c0d';
  for (let i = 0; i < 5; i++) {
    g.save();
    g.rotate((i / 5) * Math.PI * 2);
    g.beginPath();
    g.moveTo(-24, -34);
    g.quadraticCurveTo(-50, -84, -34, -106);
    g.quadraticCurveTo(0, -116, 34, -106);
    g.quadraticCurveTo(50, -84, 24, -34);
    g.quadraticCurveTo(0, -26, -24, -34);
    g.fill();
    g.restore();
  }
  g.fillStyle = '#2a2c30';
  g.beginPath();
  g.arc(0, 0, 20, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function shadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(128, 64, 8, 128, 64, 128);
  grad.addColorStop(0, 'rgba(0,0,0,0.62)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.setTransform(1, 0, 0, 0.5, 0, 32);
  g.fillStyle = grad;
  g.fillRect(0, -64, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function createCarScene(
  canvas: HTMLCanvasElement,
  options: CarSceneOptions
): CarScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: options.preserveDrawingBuffer,
  });
  renderer.setPixelRatio(
    options.pixelRatio ?? Math.min(window.devicePixelRatio || 1, 2)
  );
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.03);
  scene.environment = envTarget.texture;

  const car: CarGeometry = buildCarGeometry(options.body, options.zones);
  const { spec, arches, size } = car;

  const paintColor = new THREE.Color(options.paint ?? '#f2f3f5');
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: paintColor,
    metalness: spec.paint.metalness,
    roughness: spec.paint.roughness,
    clearcoat: spec.paint.clearcoat,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.1,
    flatShading: false,
  });
  // Wheel arches are cut per pixel so the opening is a clean circle no matter
  // how coarse the body mesh is.
  bodyMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uArch = {
      value: new THREE.Vector4(
        arches.front,
        arches.rear,
        arches.y,
        arches.radius
      ),
    };
    shader.uniforms.uArchInner = { value: arches.inner };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vWrapPos;'
      )
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvWrapPos = position;'
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vWrapPos;\nuniform vec4 uArch;\nuniform float uArchInner;'
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
        if (abs(vWrapPos.z) > uArchInner) {
          float dF = distance(vWrapPos.xy, vec2(uArch.x, uArch.z));
          float dR = distance(vWrapPos.xy, vec2(uArch.y, uArch.z));
          if (min(dF, dR) < uArch.w) discard;
        }`
      );
  };

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x05070a,
    metalness: 0.9,
    roughness: 0.06,
    envMapIntensity: 1.4,
  });
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b0b0c,
    roughness: 0.9,
    metalness: 0,
  });

  const group = new THREE.Group();
  group.add(new THREE.Mesh(car.body, bodyMaterial));
  group.add(new THREE.Mesh(car.glass, glassMaterial));
  group.add(new THREE.Mesh(car.under, darkMaterial));

  // Dark inner tub so the arch cut-outs show a wheel well, not daylight.
  const tub = new THREE.Mesh(
    new THREE.BoxGeometry(size.length * 0.9, 0.62, arches.inner * 2 + 0.3),
    darkMaterial
  );
  tub.position.y = arches.y + 0.18;
  group.add(tub);

  const disposables: { dispose(): void }[] = [
    car.body,
    car.glass,
    car.under,
    tub.geometry,
    bodyMaterial,
    glassMaterial,
    darkMaterial,
  ];

  const r = spec.wheelRadius;
  const tyreWidth = r * 0.72;
  const tyreGeometry = new THREE.CylinderGeometry(r, r, tyreWidth, 48, 1);
  tyreGeometry.rotateX(Math.PI / 2);
  const tyreMaterial = new THREE.MeshStandardMaterial({
    color: 0x101011,
    roughness: 0.85,
  });
  const rimMap = rimTexture();
  const rimGeometry = new THREE.CircleGeometry(r * 0.74, 48);
  const rimMaterial = new THREE.MeshStandardMaterial({
    map: rimMap,
    metalness: 0.75,
    roughness: 0.32,
  });
  disposables.push(tyreGeometry, tyreMaterial, rimGeometry, rimMaterial, rimMap);
  for (const hub of car.wheels) {
    const outward = Math.sign(hub.z);
    const tyre = new THREE.Mesh(tyreGeometry, tyreMaterial);
    tyre.position.copy(hub);
    group.add(tyre);
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.set(hub.x, hub.y, hub.z + outward * (tyreWidth / 2 + 0.004));
    if (outward < 0) rim.rotation.y = Math.PI;
    group.add(rim);
  }

  const shadowMap = shadowTexture();
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowMap,
    transparent: true,
    depthWrite: false,
  });
  const shadowGeometry = new THREE.PlaneGeometry(
    size.length * 1.5,
    size.width * 2.3
  );
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  group.add(shadow);
  disposables.push(shadowMap, shadowMaterial, shadowGeometry);

  scene.add(group);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x30343a, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(4, 7, 5);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const target = new THREE.Vector3(0, size.height * 0.42, 0);
  const home = () => {
    const az = THREE.MathUtils.degToRad(options.azimuth ?? 38);
    const el = THREE.MathUtils.degToRad(options.elevation ?? 16);
    const fit = Math.max(size.length, size.height * 2.2);
    const dist =
      ((fit / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) *
        (options.distance ?? 1.12)) /
      Math.min(1, camera.aspect * 0.82);
    camera.position.set(
      target.x + Math.sin(az) * Math.cos(el) * dist,
      target.y + Math.sin(el) * dist,
      target.z - Math.cos(az) * Math.cos(el) * dist
    );
    camera.lookAt(target);
  };

  let controls: OrbitControls | null = null;
  let frame = 0;
  let disposed = false;
  let needsRender = true;

  const render = () => {
    needsRender = false;
    renderer.render(scene, camera);
  };
  const invalidate = () => {
    needsRender = true;
  };

  if (options.interactive !== false) {
    controls = new OrbitControls(camera, canvas);
    controls.target.copy(target);
    controls.enablePan = false;
    controls.enableZoom = !!options.zoom;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.autoRotate = !!options.autoRotate;
    controls.autoRotateSpeed = 1.1;
    controls.addEventListener('change', invalidate);
  }

  const resize = () => {
    const w = canvas.clientWidth || canvas.width;
    const h = canvas.clientHeight || canvas.height;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!controls || !userMoved) home();
    controls?.update();
    invalidate();
  };

  let userMoved = false;
  controls?.addEventListener('start', () => {
    userMoved = true;
  });

  let texture: THREE.Texture | null = null;
  const setWrap = (source: TexImageSource | null) => {
    texture?.dispose();
    texture = null;
    if (source) {
      texture =
        source instanceof HTMLCanvasElement
          ? new THREE.CanvasTexture(source)
          : new THREE.Texture(source as HTMLImageElement);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.needsUpdate = true;
    }
    bodyMaterial.map = texture;
    // The wrap carries its own colour: a tinted base would darken it.
    bodyMaterial.color.set(texture ? 0xffffff : paintColor);
    bodyMaterial.needsUpdate = true;
    invalidate();
  };

  const loop = () => {
    if (disposed) return;
    frame = requestAnimationFrame(loop);
    if (controls && (controls.autoRotate || controls.enableDamping)) {
      controls.update();
    }
    if (needsRender) render();
  };

  resize();
  home();
  loop();

  return {
    setWrap,
    refreshWrap() {
      if (texture) texture.needsUpdate = true;
      invalidate();
    },
    setPaint(color) {
      paintColor.set(color);
      if (!texture) bodyMaterial.color.set(paintColor);
      invalidate();
    },
    setAutoRotate(on) {
      if (controls) controls.autoRotate = on;
      invalidate();
    },
    resetView() {
      userMoved = false;
      home();
      controls?.target.copy(target);
      controls?.update();
      invalidate();
    },
    resize,
    render,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      controls?.dispose();
      texture?.dispose();
      disposables.forEach((d) => d.dispose());
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}