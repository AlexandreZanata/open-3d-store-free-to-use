import { applyMat3, centerOnBuildPlate, type Mat3 } from "./meshOrientationMath.js";

/**
 * 3MF / Bambu Studio build plate is Z-up (3MF core + production spec).
 * glTF and Three.js use Y-up — rotate -90° about X only; preserve user pose.
 */
export const BAMBU_Z_UP_TO_GLTF_Y_UP: Mat3 = [1, 0, 0, 0, 0, 1, 0, -1, 0];

/** Bambu-faithful preview: Z-up bed → Y-up desk, center XZ, min Y on plate. */
export function orientBambuBuildPlateForPreview(positions: Float32Array): Float32Array {
  if (positions.length < 9) {
    return positions;
  }
  return centerOnBuildPlate(applyMat3(positions, BAMBU_Z_UP_TO_GLTF_Y_UP));
}
