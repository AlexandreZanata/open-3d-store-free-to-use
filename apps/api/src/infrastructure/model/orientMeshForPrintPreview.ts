import {
  applyMat3,
  bboxFromPositions,
  centerOnBuildPlate,
  det3,
  IDENTITY,
  mulMat3,
  rotY,
  type Mat3,
} from "./meshOrientationMath.js";
import { computeCovariance3D, principalAxesRotation } from "./meshPrincipalAxes.js";

const YAW_CANDIDATES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2] as const;
const PLATE_HEIGHT_RATIO = 0.2;

/** Manufacturing Z-up → Three.js Y-up (Bambu / 3MF build plate). */
const ROT_Z_TO_Y: Mat3 = [1, 0, 0, 0, 0, 1, 0, -1, 0];

/** Rotate so the former +X axis becomes +Y (upright pose). */
const ROT_X_TO_Y: Mat3 = [0, 1, 0, -1, 0, 0, 0, 0, 1];

function fixHandedness(matrix: Mat3): Mat3 {
  if (det3(matrix) >= 0) {
    return matrix;
  }
  return [
    matrix[0]!,
    matrix[1]!,
    matrix[2]!,
    matrix[3]!,
    matrix[4]!,
    matrix[5]!,
    -matrix[6]!,
    -matrix[7]!,
    -matrix[8]!,
  ];
}

function snapYawOnPlate(positions: Float32Array): Float32Array {
  let bestMatrix: Mat3 = IDENTITY;
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

function applySeed(positions: Float32Array, seed: Mat3): Float32Array {
  let bestMatrix = seed;
  let bestFootprint = Infinity;

  for (const yaw of YAW_CANDIDATES) {
    const matrix = mulMat3(rotY(yaw), seed);
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

function bboxDimensions(positions: Float32Array): [number, number, number] {
  const bbox = bboxFromPositions(positions, Math.max(1, Math.floor(positions.length / 3 / 4_000)));
  return [bbox.maxX - bbox.minX, bbox.maxY - bbox.minY, bbox.maxZ - bbox.minZ];
}

function looksLikeThinPlate(positions: Float32Array): boolean {
  const [dx, dy, dz] = bboxDimensions(positions);
  const height = Math.min(dx, dy, dz);
  const maxFootprint = Math.max(dx, dy, dz);
  return height / maxFootprint < PLATE_HEIGHT_RATIO;
}

/** Map the tallest bbox axis to +Y (figurine standing on the virtual desk). */
export function alignTallestAxisToY(positions: Float32Array): Float32Array {
  const [dx, dy, dz] = bboxDimensions(positions);
  const dims = [dx, dy, dz];
  const tallestIdx = dims.indexOf(Math.max(...dims));

  if (tallestIdx === 1) {
    return snapYawOnPlate(positions);
  }
  if (tallestIdx === 2) {
    return snapYawOnPlate(applyMat3(positions, ROT_Z_TO_Y));
  }
  return snapYawOnPlate(applyMat3(positions, ROT_X_TO_Y));
}

function orientThinPlateWithPca(positions: Float32Array): Float32Array {
  const { cov } = computeCovariance3D(positions);
  const smallestSeed = fixHandedness(principalAxesRotation(cov, "smallest"));
  const oriented = applySeed(positions, smallestSeed);

  if (!looksLikeThinPlate(oriented)) {
    return oriented;
  }

  const middleSeed = fixHandedness(principalAxesRotation(cov, "middle"));
  const middleOriented = applySeed(positions, middleSeed);
  const largestSeed = fixHandedness(principalAxesRotation(cov, "largest"));
  const largestOriented = applySeed(positions, largestSeed);
  const middleHeight = bboxFromPositions(middleOriented, 1).maxY - bboxFromPositions(middleOriented, 1).minY;
  const largestHeight = bboxFromPositions(largestOriented, 1).maxY - bboxFromPositions(largestOriented, 1).minY;
  return largestHeight > middleHeight ? largestOriented : middleOriented;
}

/**
 * Storefront preview pose: figurines stand on the desk; thin plates use PCA fallback.
 * Preserves slicer build-plate orientation when the mesh is already upright.
 */
export function orientMeshForPrintPreview(positions: Float32Array): Float32Array {
  if (positions.length < 9) {
    return positions;
  }

  if (looksLikeThinPlate(positions)) {
    return orientThinPlateWithPca(positions);
  }

  return alignTallestAxisToY(positions);
}

/** 3MF / Bambu meshes already include build transforms — only stand tall and center. */
export function orientPrintPlateMesh(positions: Float32Array): Float32Array {
  if (positions.length < 9) {
    return positions;
  }
  return alignTallestAxisToY(positions);
}
