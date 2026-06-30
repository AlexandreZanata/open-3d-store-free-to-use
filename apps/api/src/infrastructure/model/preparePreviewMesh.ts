import { positionsToMeters } from "./documentFromMesh.js";
import { orientSlicerExportForPreview } from "./orientMeshForPrintPreview.js";

export type PreparePreviewMeshOptions = {
  /** Bambu / 3MF build items already carry plate orientation. */
  source?: "stl" | "3mf";
};

/** Unit normalize and slicer-style upright orientation for web preview. */
export async function preparePreviewMesh(
  positions: Float32Array,
  _options?: PreparePreviewMeshOptions,
): Promise<Float32Array> {
  const meters = positionsToMeters(positions);
  return orientSlicerExportForPreview(meters);
}
