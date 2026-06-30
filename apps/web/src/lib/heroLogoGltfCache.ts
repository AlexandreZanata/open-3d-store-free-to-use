import type { Object3D } from "three";

import { loadGltfScene } from "@/components/ModelViewer/createGltfLoader.js";

let cachedScene: Promise<Object3D> | null = null;

/** Single-flight GLB parse — reused by hero viewer remounts. */
export function loadHeroGltfCached(modelUrl: string): Promise<Object3D> {
  cachedScene ??= loadGltfScene(modelUrl);
  return cachedScene;
}

export function resetHeroGltfCacheForTests(): void {
  cachedScene = null;
}
