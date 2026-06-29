import { positionsToMeters } from "./documentFromMesh.js";
import { orientMeshForPrintPreview } from "./orientMeshForPrintPreview.js";
import { simplifyTriangleSoup } from "./simplifyTriangleSoup.js";

export const PREVIEW_MESH_MAX_VERTICES = 150_000;

/** Unit normalize, slicer-style upright orientation, and decimate for web preview. */
export async function preparePreviewMesh(positions: Float32Array): Promise<Float32Array> {
  const meters = positionsToMeters(positions);
  const oriented = orientMeshForPrintPreview(meters);
  return simplifyTriangleSoup(oriented, PREVIEW_MESH_MAX_VERTICES);
}
