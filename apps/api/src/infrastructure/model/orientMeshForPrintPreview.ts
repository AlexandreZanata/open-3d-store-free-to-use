/** Row-major 3×3 rotation matrix. */
type Mat3 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

const IDENTITY: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

function rotX(rad: number): Mat3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [1, 0, 0, 0, c, -s, 0, s, c];
}

function rotY(rad: number): Mat3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}

function rotZ(rad: number): Mat3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

function mulMat3(a: Mat3, b: Mat3): Mat3 {
  return [
    a[0]! * b[0]! + a[1]! * b[3]! + a[2]! * b[6]!,
    a[0]! * b[1]! + a[1]! * b[4]! + a[2]! * b[7]!,
    a[0]! * b[2]! + a[1]! * b[5]! + a[2]! * b[8]!,
    a[3]! * b[0]! + a[4]! * b[3]! + a[5]! * b[6]!,
    a[3]! * b[1]! + a[4]! * b[4]! + a[5]! * b[7]!,
    a[3]! * b[2]! + a[4]! * b[5]! + a[5]! * b[8]!,
    a[6]! * b[0]! + a[7]! * b[3]! + a[8]! * b[6]!,
    a[6]! * b[1]! + a[7]! * b[4]! + a[8]! * b[7]!,
    a[6]! * b[2]! + a[7]! * b[5]! + a[8]! * b[8]!,
  ];
}

function buildOrientationCandidates(): Mat3[] {
  const axisUp = [
    rotX(-Math.PI / 2),
    IDENTITY,
    rotX(Math.PI / 2),
    rotZ(-Math.PI / 2),
    rotZ(Math.PI / 2),
  ];
  const candidates: Mat3[] = [];
  for (const base of axisUp) {
    for (let quarter = 0; quarter < 4; quarter += 1) {
      candidates.push(mulMat3(rotY((quarter * Math.PI) / 2), base));
    }
  }
  return candidates;
}

const ORIENTATION_CANDIDATES = buildOrientationCandidates();

function applyMat3(positions: Float32Array, matrix: Mat3): Float32Array {
  const out = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]!;
    const y = positions[i + 1]!;
    const z = positions[i + 2]!;
    out[i] = matrix[0]! * x + matrix[1]! * y + matrix[2]! * z;
    out[i + 1] = matrix[3]! * x + matrix[4]! * y + matrix[5]! * z;
    out[i + 2] = matrix[6]! * x + matrix[7]! * y + matrix[8]! * z;
  }
  return out;
}

type Bbox = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
};

function bboxFromPositions(positions: Float32Array, vertexStride: number): Bbox {
  const bbox: Bbox = {
    minX: Infinity,
    minY: Infinity,
    minZ: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    maxZ: -Infinity,
  };
  for (let v = 0; v < positions.length; v += 3 * vertexStride) {
    const x = positions[v]!;
    const y = positions[v + 1]!;
    const z = positions[v + 2]!;
    bbox.minX = Math.min(bbox.minX, x);
    bbox.minY = Math.min(bbox.minY, y);
    bbox.minZ = Math.min(bbox.minZ, z);
    bbox.maxX = Math.max(bbox.maxX, x);
    bbox.maxY = Math.max(bbox.maxY, y);
    bbox.maxZ = Math.max(bbox.maxZ, z);
  }
  return bbox;
}

/** Higher score = taller upright pose on the build plate (storefront display). */
export function scorePrintOrientation(bbox: Bbox): number {
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  const depth = bbox.maxZ - bbox.minZ;
  const footprint = width * depth;
  return height * 1_000 + footprint;
}

/** Align mesh Y-up on the virtual build plate (glTF convention). */
export function orientMeshForPrintPreview(positions: Float32Array): Float32Array {
  const vertexCount = positions.length / 3;
  const sampleStride = Math.max(1, Math.floor(vertexCount / 8_000));

  let bestMatrix = ORIENTATION_CANDIDATES[0]!;
  let bestScore = -Infinity;

  for (const matrix of ORIENTATION_CANDIDATES) {
    const rotated = applyMat3(positions, matrix);
    const score = scorePrintOrientation(bboxFromPositions(rotated, sampleStride));
    if (score > bestScore) {
      bestScore = score;
      bestMatrix = matrix;
    }
  }

  return applyMat3(positions, bestMatrix);
}
