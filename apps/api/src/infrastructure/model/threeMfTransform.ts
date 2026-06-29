/** 3MF row-major 3×4 transform (Khronos 3D Manufacturing Format). */
export type Mat4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
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

export const IDENTITY_MAT4: Mat4 = [
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
];

/** Parse `m00…m22 tx ty tz` from a 3MF transform attribute. */
export function parse3mfTransform(raw: string | null): Mat4 {
  if (!raw?.trim()) {
    return IDENTITY_MAT4;
  }
  const values = raw.trim().split(/\s+/).map(Number);
  if (values.length < 12 || values.some((value) => !Number.isFinite(value))) {
    return IDENTITY_MAT4;
  }
  const [m00, m01, m02, m10, m11, m12, m20, m21, m22, tx, ty, tz] = values;
  return [m00!, m01!, m02!, 0, m10!, m11!, m12!, 0, m20!, m21!, m22!, 0, tx!, ty!, tz!, 1];
}

export function multiplyMat4(a: Mat4, b: Mat4): Mat4 {
  const out = new Array<number>(16);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) {
        sum += a[row * 4 + k]! * b[k * 4 + col]!;
      }
      out[row * 4 + col] = sum;
    }
  }
  return out as Mat4;
}

export function transformPoint(matrix: Mat4, x: number, y: number, z: number): [number, number, number] {
  return [
    matrix[0]! * x + matrix[1]! * y + matrix[2]! * z + matrix[12]!,
    matrix[4]! * x + matrix[5]! * y + matrix[6]! * z + matrix[13]!,
    matrix[8]! * x + matrix[9]! * y + matrix[10]! * z + matrix[14]!,
  ];
}
