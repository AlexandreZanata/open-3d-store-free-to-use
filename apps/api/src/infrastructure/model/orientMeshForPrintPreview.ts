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
import { orientBambuBuildPlateForPreview } from "./orientBambuBuildPlate.js";

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

const Z_PLATE_TOL = 0.01;
/** When Y span exceeds Z by more than this factor, mesh transforms already define up. */
const Y_DOMINANCE_RATIO = 1.05;

function sitsOnZBuildPlate(positions: Float32Array): boolean {
  const plate = bboxFromPositions(positions, 1);
  return plate.minZ >= -0.001 && plate.minZ < Z_PLATE_TOL;
}

/** Bambu 3MF / STL sit on Z=0; rotate only when height is not already on +Y. */
function shouldApplyZUpToYUp(positions: Float32Array): boolean {
  if (!sitsOnZBuildPlate(positions)) {
    return false;
  }
  const [dx, dy, dz] = bboxDimensions(positions);
  if (looksLikeThinPlate(positions)) {
    return true;
  }
  return dy <= dz * Y_DOMINANCE_RATIO;
}

/**
 * Bambu / Prusa STL and 3MF exports use a Z-up build plate; glTF and Three.js are Y-up.
 * Apply -90° about X when the mesh sits on Z=0 and height is not already on +Y.
 */
export function orientSlicerExportForPreview(positions: Float32Array): Float32Array {
  if (positions.length < 9) {
    return positions;
  }

  if (!shouldApplyZUpToYUp(positions)) {
    if (looksLikeThinPlate(positions)) {
      return orientThinPlateWithPca(positions);
    }
    return alignTallestAxisToY(positions);
  }

  return orientBambuBuildPlateForPreview(positions);
}

/** @deprecated — use orientSlicerExportForPreview */
export function orientMeshForPrintPreview(positions: Float32Array): Float32Array {
  return orientSlicerExportForPreview(positions);
}
/** Rotate flat logo (thin Y, spread in XZ) to stand on the build-plate edge. */
const ROT_FLAT_Y_TO_STAND: Mat3 = [1, 0, 0, 0, 0, -1, 0, 1, 0];

/** Head-up correction after standing (Corvo STL exports inverted on Y). */
const ROT_FLIP_X: Mat3 = [1, 0, 0, 0, -1, 0, 0, 0, -1];

/** Hero Corvo STL: flat on bed (thin Y) — stand on edge with Z as height. */
export function orientHeroLogoMesh(positions: Float32Array): Float32Array {
  if (positions.length < 9) {
    return positions;
  }

  const [dx, dy, dz] = bboxDimensions(positions);
  const thinIdx = [dx, dy, dz].indexOf(Math.min(dx, dy, dz));

  if (thinIdx === 1) {
    return snapYawOnPlate(applyMat3(positions, mulMat3(ROT_FLIP_X, ROT_FLAT_Y_TO_STAND)));
  }

  return alignTallestAxisToY(positions);
}

/** 3MF build items carry plate transforms but remain Z-up — same pipeline as STL. */
export function orientPrintPlateMesh(positions: Float32Array): Float32Array {
  return orientSlicerExportForPreview(positions);
}
