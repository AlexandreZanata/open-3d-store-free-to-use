import type { Object3D } from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

/** Khronos Draco binaries — required for server-optimized preview GLB files. */
const DRACO_DECODER_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

let gltfLoaderPromise: Promise<GLTFLoader> | null = null;

export async function loadGltfScene(url: string): Promise<Object3D> {
  const loader = await getGltfLoader();
  const gltf = await loader.loadAsync(url);
  return gltf.scene;
}

async function getGltfLoader(): Promise<GLTFLoader> {
  gltfLoaderPromise ??= createGltfLoader();
  return gltfLoaderPromise;
}

async function createGltfLoader(): Promise<GLTFLoader> {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_DECODER_PATH);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  await MeshoptDecoder.ready;
  loader.setMeshoptDecoder(MeshoptDecoder);

  return loader;
}
