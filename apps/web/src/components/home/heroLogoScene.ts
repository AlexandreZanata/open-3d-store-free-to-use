import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { loadGltfScene } from "@/components/ModelViewer/createGltfLoader.js";
import { probeModelAsset } from "@/lib/modelViewerLimits";

const LOGO_COLOR = 0x1f2937;
const ROTATE_SPEED = 0.35;

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
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    34,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.001,
    100,
  );

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = ROTATE_SPEED;

  scene.add(new THREE.AmbientLight(0xffffff, 0.72));
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(2, 3, 2);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.45);
  rim.position.set(-2, 1, -1);
  scene.add(rim);

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
    if (!mesh.geometry.attributes.normal) {
      mesh.geometry.computeVertexNormals();
    }
    mesh.material = new THREE.MeshStandardMaterial({
      color: LOGO_COLOR,
      metalness: 0.35,
      roughness: 0.42,
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

  const maxDim = Math.max(size.x, size.y, size.z, 0.01);
  const distance = maxDim * 2.1;
  camera.position.set(distance * 0.35, distance * 0.55, distance * 0.9);
  controls.target.set(0, 0, 0);
  camera.near = distance / 100;
  camera.far = distance * 20;
  camera.updateProjectionMatrix();
  controls.update();
}
