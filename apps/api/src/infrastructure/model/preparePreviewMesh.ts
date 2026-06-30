import { positionsToMeters } from "./documentFromMesh.js";
import { orientBambuBuildPlateForPreview } from "./orientBambuBuildPlate.js";
import { orientSlicerExportForPreview } from "./orientMeshForPrintPreview.js";

export type PreparePreviewMeshOptions = {
  /** Hint for unit normalization — glTF is already meters. */
  source?: "stl" | "3mf" | "glb";
};

/** Unit normalize and orient for web preview (Bambu 3MF preserves slicer pose). */
export async function preparePreviewMesh(
  positions: Float32Array,
  options?: PreparePreviewMeshOptions,
): Promise<Float32Array> {
  const meters = positionsToMeters(positions);
  if (options?.source === "3mf") {
    return orientBambuBuildPlateForPreview(meters);
  }
  return orientSlicerExportForPreview(meters);
}
