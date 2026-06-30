import {
  applyMat3,
  bboxFromPositions,
  centerOnBuildPlate,
  rotY,
  type Mat3,
} from "./meshOrientationMath.js";

const YAW_CANDIDATES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2] as const;
const PLATE_HEIGHT_RATIO = 0.2;

/** Flip face-down plate while keeping +X alignment. */
const ROT_FLIP_FACE: Mat3 = [1, 0, 0, 0, -1, 0, 0, 0, -1];

export function isThinOnYAxis(positions: Float32Array): boolean {
  const bbox = bboxFromPositions(positions, Math.max(1, Math.floor(positions.length / 3 / 4_000)));
  const dx = bbox.maxX - bbox.minX;
  const dy = bbox.maxY - bbox.minY;
  const dz = bbox.maxZ - bbox.minZ;
  const maxFoot = Math.max(dx, dz);
  return maxFoot > 0 && dy / maxFoot < PLATE_HEIGHT_RATIO;
}

function meanTriangleNormalY(positions: Float32Array): number {
  let sumY = 0;
  let count = 0;
  for (let i = 0; i < positions.length; i += 9) {
    const ax = positions[i]!;
    const ay = positions[i + 1]!;
    const az = positions[i + 2]!;
    const bx = positions[i + 3]!;
    const by = positions[i + 4]!;
    const bz = positions[i + 5]!;
    const cx = positions[i + 6]!;
    const cy = positions[i + 7]!;
    const cz = positions[i + 8]!;
    const e1x = bx - ax;
    const e1y = by - ay;
    const e1z = bz - az;
    const e2x = cx - ax;
    const e2y = cy - ay;
    const e2z = cz - az;
    const nx = e1y * e2z - e1z * e2y;
    const ny = e1z * e2x - e1x * e2z;
    const nz = e1x * e2y - e1y * e2x;
    const len = Math.hypot(nx, ny, nz);
    if (len > 1e-12) {
      sumY += ny / len;
      count += 1;
    }
  }
  return count > 0 ? sumY / count : 0;
}

function snapYawOnPlate(positions: Float32Array): Float32Array {
  let bestMatrix: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  let bestFootprint = Infinity;

  for (const yaw of YAW_CANDIDATES) {
    const matrix = rotY(yaw);
    const rotated = applyMat3(positions, matrix);
    const bbox = bboxFromPositions(rotated, Math.max(1, Math.floor(rotated.length / 3 / 4_000)));
    const footprint = (bbox.maxX - bbox.minX) * (bbox.maxZ - bbox.minZ);
    if (footprint < bestFootprint) {
      bestFootprint = footprint;
      bestMatrix = matrix;
    }
  }

  return centerOnBuildPlate(applyMat3(positions, bestMatrix));
}

/** Bambu bed plate: thin on +Y, face-up on the virtual desk (matches Bambu Studio top view). */
export function orientFlatBedPlateFaceUp(positions: Float32Array): Float32Array {
  let oriented = snapYawOnPlate(positions);
  if (meanTriangleNormalY(oriented) < 0) {
    oriented = centerOnBuildPlate(applyMat3(oriented, ROT_FLIP_FACE));
  }
  return oriented;
}
