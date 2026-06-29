import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { loadGltfScene } from "@/components/ModelViewer/createGltfLoader.js";
import { probeModelAsset } from "@/lib/modelViewerLimits";

/** Brand accent — matches desktop hero gradient (oklch 0.68 0.18 45). */
const LOGO_COLOR = 0xd4620a;
const ROTATE_SPEED = 0.35;
const FIT_SIZE = 1.6;

export type HeroLogoHandle = {
  dispose: () => void;
};

export type HeroLogoMountOptions = {
  modelUrl: string;
  onReady?: () => void;
  onError?: () => void;
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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    34,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.01,
    200,
  );

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = ROTATE_SPEED;

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(2.5, 4, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xfff4e8, 0.55);
  fill.position.set(-2.5, 1.5, -2);
  scene.add(fill);

  let frameId = 0;
  let modelRoot: THREE.Object3D | null = null;
  let cancelled = false;

  const animate = () => {
    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  void (async () => {
    const probe = await probeModelAsset(resolved.modelUrl);
    if (cancelled || !probe.ok) {
      resolved.onError?.();
      return;
    }

    try {
      const object = await loadGltfScene(resolved.modelUrl);
      if (cancelled) {
        return;
      }

      normalizeHeroMesh(object);
      fitHeroModel(object, camera, controls);
      modelRoot = object;
      scene.add(object);
      resolved.onReady?.();
    } catch {
      resolved.onError?.();
    }
  })();

  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) {
      return;
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
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
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
  };
}

function normalizeHeroMesh(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }
    const mesh = object as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
    const geometry = mesh.geometry;
    if (!geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }
    mesh.material = new THREE.MeshStandardMaterial({
      color: LOGO_COLOR,
      metalness: 0.28,
      roughness: 0.38,
      envMapIntensity: 0.6,
    });
  });
}

function fitHeroModel(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
): void {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  object.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const scale = FIT_SIZE / maxDim;
  object.scale.setScalar(scale);

  const distance = FIT_SIZE * 2.4;
  camera.position.set(distance * 0.2, distance * 0.12, distance * 0.95);
  controls.target.set(0, 0, 0);
  camera.near = 0.05;
  camera.far = distance * 12;
  camera.updateProjectionMatrix();
  controls.update();
}
