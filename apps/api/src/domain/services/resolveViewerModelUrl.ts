import { access } from "node:fs/promises";
import path from "node:path";

/** Public URL for the Draco preview sibling of a catalog model path. */
export function previewUrlForSource(publicUrl: string): string {
  return publicUrl.replace(/\.[^.]+$/, "") + "-preview.glb";
}

/**
 * Storefront should load the optimized preview GLB when it exists on disk.
 * Contract: docs/features/3d-viewer.md
 */
export async function resolveViewerModelUrl(
  modelFileUrl: string | null,
  modelsBasePath: string,
): Promise<string | null> {
  if (!modelFileUrl) {
    return null;
  }
  if (modelFileUrl.endsWith("-preview.glb")) {
    return modelFileUrl;
  }

  const previewUrl = previewUrlForSource(modelFileUrl);
  const relative = previewUrl.replace(/^\/models\//, "");
  const absolute = path.resolve(modelsBasePath, relative);

  try {
    await access(absolute);
    return previewUrl;
  } catch {
    return modelFileUrl;
  }
}
