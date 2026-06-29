import { positionsToMeters } from "./documentFromMesh.js";
import { orientMeshForPrintPreview } from "./orientMeshForPrintPreview.js";

/** Unit normalize and slicer-style upright orientation for web preview. */
export async function preparePreviewMesh(positions: Float32Array): Promise<Float32Array> {
  const meters = positionsToMeters(positions);
  return orientMeshForPrintPreview(meters);
}
