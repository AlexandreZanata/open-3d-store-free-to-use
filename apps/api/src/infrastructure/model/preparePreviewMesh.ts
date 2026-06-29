import { positionsToMeters } from "./documentFromMesh.js";
import {
  orientMeshForPrintPreview,
  orientPrintPlateMesh,
} from "./orientMeshForPrintPreview.js";

export type PreparePreviewMeshOptions = {
  /** Bambu / 3MF build items already carry plate orientation. */
  source?: "stl" | "3mf";
};

/** Unit normalize and slicer-style upright orientation for web preview. */
export async function preparePreviewMesh(
  positions: Float32Array,
  options?: PreparePreviewMeshOptions,
): Promise<Float32Array> {
  const meters = positionsToMeters(positions);
  if (options?.source === "3mf") {
    return orientPrintPlateMesh(meters);
  }
  return orientMeshForPrintPreview(meters);
}
