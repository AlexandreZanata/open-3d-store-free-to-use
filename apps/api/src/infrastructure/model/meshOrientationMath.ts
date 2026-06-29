/** Row-major 3×3 matrix helpers for mesh orientation. */
export type Mat3 = readonly [
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

export type Vec3 = readonly [number, number, number];

export const IDENTITY: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function rotY(rad: number): Mat3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}

export function mulMat3(a: Mat3, b: Mat3): Mat3 {
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

export function applyMat3(positions: Float32Array, matrix: Mat3): Float32Array {
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

export function det3(m: Mat3): number {
  return (
    m[0]! * (m[4]! * m[8]! - m[5]! * m[7]!) -
    m[1]! * (m[3]! * m[8]! - m[5]! * m[6]!) +
    m[2]! * (m[3]! * m[7]! - m[4]! * m[6]!)
  );
}

export type Bbox = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
};

export function bboxFromPositions(positions: Float32Array, vertexStride: number): Bbox {
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

export function centerOnBuildPlate(positions: Float32Array): Float32Array {
  const bbox = bboxFromPositions(positions, 1);
  const cx = (bbox.minX + bbox.maxX) / 2;
  const cz = (bbox.minZ + bbox.maxZ) / 2;
  const out = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    out[i] = positions[i]! - cx;
    out[i + 1] = positions[i + 1]! - bbox.minY;
    out[i + 2] = positions[i + 2]! - cz;
  }
  return out;
}
