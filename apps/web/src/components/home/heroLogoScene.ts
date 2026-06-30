import * as THREE from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

import { loadHeroGltfCached } from "@/lib/heroLogoGltfCache.js";
import { probeModelAsset } from "@/lib/modelViewerLimits";

/** Solid black — readable on the white hero card. */
export const HERO_LOGO_COLOR = 0x141414;
export const HERO_LOGO_COLOR_HEX = "#141414";
/** Matches `PerspectiveCamera` in `mountHeroLogoViewer`. */
export const HERO_LOGO_CAMERA_FOV = 34;
/** Bounding-sphere radius after centering (reference corvo GLB). */
export const HERO_LOGO_REFERENCE_SPHERE_RADIUS = 0.52;
/** Extra margin so the mesh stays inside the rounded hero tile. */
export const HERO_LOGO_FIT_PADDING = 1.28;
/** Zoom factor on top of the fitted frame (1.30 = 30% larger than fit, still centered). */
export const HERO_LOGO_VIEW_SCALE = 1.3;
/** Black PNG fallback — 25% smaller than the fitted GLB footprint. */
export const HERO_LOGO_PLACEHOLDER_SCALE = 0.75;
/** Turntable spin on the Y axis (radians per second). */
export const HERO_LOGO_TURN_SPEED = 0.22;

export type HeroLogoHandle = {
  dispose: () => void;
  pause: () => void;
  resume: () => void;
  reparentTo: (container: HTMLElement) => void;
};

export type HeroLogoMountOptions = {
  modelUrl: string;
  /** Skip HEAD probe — hero asset is a known small bundled GLB. */
  skipProbe?: boolean;
  onReady?: () => void;
};

export function mountHeroLogoViewer(
  container: HTMLElement,
  options: HeroLogoMountOptions | string,
): HeroLogoHandle {
  const resolved = typeof options === "string" ? { modelUrl: options } : options;
  const scene = new THREE.Scene();
  scene.background = null;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    HERO_LOGO_CAMERA_FOV,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.01,
    200,
  );

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2, 4.5, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xf5f5f5, 0.5);
  fill.position.set(-3, 2, -1);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.75);
  rim.position.set(0, 2, -4);
  scene.add(rim);

  let lastFrameMs = performance.now();
  let frameId = 0;
  let modelRoot: THREE.Object3D | null = null;
  let cancelled = false;
  let paused = false;

  const refitCamera = () => {
    if (!modelRoot) {
      return;
    }
    fitCameraToModel(modelRoot, camera, container.clientWidth, container.clientHeight);
  };

  const animate = (now: number) => {
    frameId = requestAnimationFrame(animate);
    const delta = (now - lastFrameMs) / 1000;
    lastFrameMs = now;
    if (!paused && modelRoot) {
      modelRoot.rotation.y += HERO_LOGO_TURN_SPEED * delta;
    }
    renderer.render(scene, camera);
  };
  requestAnimationFrame(animate);

  void (async () => {
    if (!resolved.skipProbe) {
      const probe = await probeModelAsset(resolved.modelUrl);
      if (cancelled || !probe.ok) {
        return;
      }
    }

    try {
      const object = await loadHeroGltfCached(resolved.modelUrl);
      if (cancelled) {
        return;
      }

      normalizeHeroMesh(object);
      centerHeroModel(object);
      modelRoot = object;
      scene.add(object);
      refitCamera();
      resolved.onReady?.();
    } catch {
      // Leave canvas empty — no static logo fallback in this slot.
    }
  })();

  let observedContainer = container;

  const syncRendererSize = () => {
    const width = observedContainer.clientWidth;
    const height = observedContainer.clientHeight;
    if (width === 0 || height === 0) {
      return;
    }
    camera.aspect = width / height;
    refitCamera();
    renderer.setSize(width, height);
  };

  const resizeObserver = new ResizeObserver(() => {
    syncRendererSize();
  });
  resizeObserver.observe(container);

  return {
    dispose() {
      cancelled = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      if (modelRoot) {
        scene.remove(modelRoot);
        modelRoot = null;
      }
      renderer.dispose();
      renderer.domElement.remove();
    },
    pause() {
      paused = true;
    },
    resume() {
      paused = false;
      lastFrameMs = performance.now();
    },
    reparentTo(nextContainer: HTMLElement) {
      observedContainer = nextContainer;
      nextContainer.appendChild(renderer.domElement);
      resizeObserver.disconnect();
      resizeObserver.observe(nextContainer);
      syncRendererSize();
    },
  };
}

function normalizeHeroMesh(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }
    const mesh = object as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
    const geometry = prepareHeroGeometry(mesh.geometry);
    mesh.geometry = geometry;
    mesh.material = new THREE.MeshStandardMaterial({
      color: HERO_LOGO_COLOR,
      metalness: 0.42,
      roughness: 0.38,
      side: THREE.DoubleSide,
      flatShading: false,
      depthWrite: true,
      depthTest: true,
    });
  });
}

function prepareHeroGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  const merged = mergeVertices(geometry);
  merged.computeVertexNormals();
  return merged;
}

function centerHeroModel(object: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
}

export function fitCameraToModel(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
): void {
  const sphere = new THREE.Box3().setFromObject(object).getBoundingSphere(new THREE.Sphere());
  const radius = Math.max(sphere.radius, 0.001);
  const fovRad = (camera.fov * Math.PI) / 180;
  const aspect = width / Math.max(height, 1);
  const hFov = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
  const distanceY = radius / Math.sin(fovRad / 2);
  const distanceX = radius / Math.sin(hFov / 2);
  const distance = (Math.max(distanceX, distanceY) * HERO_LOGO_FIT_PADDING) / HERO_LOGO_VIEW_SCALE;

  camera.position.set(0, 0, distance);
  camera.lookAt(0, 0, 0);
  camera.near = Math.max(distance / 200, 0.001);
  camera.far = distance * 24;
  camera.updateProjectionMatrix();
}

/** Screen diameter fraction — same fit math as `fitCameraToModel`. */
export function heroLogoPlaceholderDiameterRatio(
  aspect: number,
  sphereRadius = HERO_LOGO_REFERENCE_SPHERE_RADIUS,
): number {
  const fovRad = (HERO_LOGO_CAMERA_FOV * Math.PI) / 180;
  const safeAspect = Math.max(aspect, 0.01);
  const hFov = 2 * Math.atan(Math.tan(fovRad / 2) * safeAspect);
  const distanceY = sphereRadius / Math.sin(fovRad / 2);
  const distanceX = sphereRadius / Math.sin(hFov / 2);
  const distance = (Math.max(distanceX, distanceY) * HERO_LOGO_FIT_PADDING) / HERO_LOGO_VIEW_SCALE;
  const visibleHeight = 2 * distance * Math.tan(fovRad / 2);
  return Math.min(1, (2 * sphereRadius) / visibleHeight);
}
