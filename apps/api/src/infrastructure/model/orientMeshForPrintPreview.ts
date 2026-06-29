import {
  applyMat3,
  bboxFromPositions,
  centerOnBuildPlate,
  det3,
  mulMat3,
  rotY,
  type Mat3,
} from "./meshOrientationMath.js";
import { computeCovariance3D, principalAxesRotation } from "./meshPrincipalAxes.js";

const YAW_CANDIDATES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2] as const;
const PLATE_HEIGHT_METERS = 0.02;
const PLATE_HEIGHT_RATIO = 0.2;

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

function looksLikeThinPlate(positions: Float32Array): boolean {
  const bbox = bboxFromPositions(positions, Math.max(1, Math.floor(positions.length / 3 / 4_000)));
  const height = bbox.maxY - bbox.minY;
  const width = bbox.maxX - bbox.minX;
  const depth = bbox.maxZ - bbox.minZ;
  const maxFootprint = Math.max(width, depth);
  return height < PLATE_HEIGHT_METERS && height / maxFootprint < PLATE_HEIGHT_RATIO;
}

/**
 * PCA upright pose for storefront preview (figurine standing on the virtual desk).
 * Smallest variance axis → Y-up; thin plates fall back to the middle axis.
 */
export function orientMeshForPrintPreview(positions: Float32Array): Float32Array {
  if (positions.length < 9) {
    return positions;
  }

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
