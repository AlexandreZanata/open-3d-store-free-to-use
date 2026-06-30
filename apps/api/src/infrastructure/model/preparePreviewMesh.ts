import { positionsToMeters } from "./documentFromMesh.js";
import { orientSlicerExportForPreview } from "./orientMeshForPrintPreview.js";

export type PreparePreviewMeshOptions = {
  /** Hint for unit normalization — glTF is already meters. */
  source?: "stl" | "3mf" | "glb";
};

/** Unit normalize and slicer-style upright orientation for web preview. */
export async function preparePreviewMesh(
  positions: Float32Array,
  _options?: PreparePreviewMeshOptions,
): Promise<Float32Array> {
  const meters = positionsToMeters(positions);
  return orientSlicerExportForPreview(meters);
}
