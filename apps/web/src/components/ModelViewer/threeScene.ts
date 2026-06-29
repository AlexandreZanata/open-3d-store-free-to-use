import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { ThreeMFLoader } from "three/addons/loaders/3MFLoader.js";

import {
  detectModelFormat,
  formatDimensionsMm,
  usesMillimeterUnits,
  type ModelFormat,
} from "@/lib/modelFormat";

const SCENE_BG = 0xf4f4f5;

export type MountOptions = {
  modelUrl: string;
  onReady?: () => void;
  onError?: () => void;
  onDimensions?: (text: string) => void;
};

function addVirtualDesk(scene: THREE.Scene, format: ModelFormat): void {
  const isMm = usesMillimeterUnits(format);
  const width = isMm ? 280 : 0.28;
  const depth = isMm ? 200 : 0.2;

  const desk = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshStandardMaterial({ color: 0xc8b8a8, roughness: 0.88, metalness: 0 }),
  );
  desk.rotation.x = -Math.PI / 2;
  desk.receiveShadow = true;
  scene.add(desk);

  const grid = new THREE.GridHelper(width, 14, 0x9ca3af, 0xd1d5db);
  grid.position.y = isMm ? 0.2 : 0.0002;
  scene.add(grid);
}

function addLights(scene: THREE.Scene): void {
  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const key = new THREE.DirectionalLight(0xffffff, 0.95);
  key.position.set(140, 220, 120);
  key.castShadow = true;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.32);
  fill.position.set(-90, 80, -140);
  scene.add(fill);
}

function placeOnDesk(object: THREE.Object3D): THREE.Vector3 {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= box.min.y;
  return new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
}

function fitCamera(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  size: THREE.Vector3,
  format: ModelFormat,
): void {
  const maxDim = Math.max(size.x, size.y, size.z, usesMillimeterUnits(format) ? 40 : 0.04);
  const distance = maxDim * 2.4;
  camera.position.set(distance * 0.65, distance * 0.5, distance * 0.9);
  controls.target.set(0, size.y / 2, 0);
  camera.near = Math.max(distance / 200, usesMillimeterUnits(format) ? 0.5 : 0.0005);
  camera.far = distance * 30;
  camera.updateProjectionMatrix();
  controls.minDistance = distance * 0.35;
  controls.maxDistance = distance * 4;
  controls.update();
}

async function loadModel(url: string, format: ModelFormat): Promise<THREE.Object3D> {
  if (format === "3mf") {
    const loader = new ThreeMFLoader();
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  if (format === "stl") {
    const loader = new STLLoader();
    const geometry = await loader.loadAsync(url);
    const material = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      metalness: 0.12,
      roughness: 0.62,
    });
    return new THREE.Mesh(geometry, material);
  }

  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  return gltf.scene;
}

export function mountThreeModelViewer(container: HTMLElement, options: MountOptions): () => void {
  const format = detectModelFormat(options.modelUrl);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE_BG);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    38,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.01,
    50_000,
  );

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = true;

  addLights(scene);
  addVirtualDesk(scene, format);

  let frameId = 0;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  let modelRoot: THREE.Object3D | null = null;
  let cancelled = false;

  void loadModel(options.modelUrl, format)
    .then((object) => {
      if (cancelled) {
        return;
      }
      modelRoot = object;
      object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      const size = placeOnDesk(object);
      scene.add(object);
      fitCamera(camera, controls, size, format);
      options.onDimensions?.(formatDimensionsMm(size.x, size.y, size.z, format));
      options.onReady?.();
    })
    .catch(() => {
      if (!cancelled) {
        options.onError?.();
      }
    });

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

  return () => {
    cancelled = true;
    cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    if (modelRoot) {
      scene.remove(modelRoot);
    }
    controls.dispose();
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
}
