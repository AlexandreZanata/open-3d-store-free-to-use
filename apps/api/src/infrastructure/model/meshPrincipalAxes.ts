import type { Mat3, Vec3 } from "./meshOrientationMath.js";

const SAMPLE_TARGET = 4_096;

type Symmetric3 = [number, number, number, number, number, number];

/** Sampled mean + covariance (xx, yy, zz, xy, xz, yz). */
export function computeCovariance3D(positions: Float32Array): {
  mean: Vec3;
  cov: Symmetric3;
} {
  const vertexCount = positions.length / 3;
  const stride = Math.max(1, Math.floor(vertexCount / SAMPLE_TARGET));
  let count = 0;
  let mx = 0;
  let my = 0;
  let mz = 0;

  for (let v = 0; v < vertexCount; v += stride) {
    const i = v * 3;
    mx += positions[i]!;
    my += positions[i + 1]!;
    mz += positions[i + 2]!;
    count += 1;
  }

  mx /= count;
  my /= count;
  mz /= count;

  let xx = 0;
  let yy = 0;
  let zz = 0;
  let xy = 0;
  let xz = 0;
  let yz = 0;

  for (let v = 0; v < vertexCount; v += stride) {
    const i = v * 3;
    const dx = positions[i]! - mx;
    const dy = positions[i + 1]! - my;
    const dz = positions[i + 2]! - mz;
    xx += dx * dx;
    yy += dy * dy;
    zz += dz * dz;
    xy += dx * dy;
    xz += dx * dz;
    yz += dy * dz;
  }

  const inv = 1 / count;
  return {
    mean: [mx, my, mz],
    cov: [xx * inv, yy * inv, zz * inv, xy * inv, xz * inv, yz * inv],
  };
}

/** Jacobi eigen decomposition for 3×3 symmetric matrix. */
export function symmetricEigen3x3(cov: Symmetric3): {
  values: [number, number, number];
  vectors: [Vec3, Vec3, Vec3];
} {
  const a = [
    [cov[0], cov[3], cov[4]],
    [cov[3], cov[1], cov[5]],
    [cov[4], cov[5], cov[2]],
  ];
  const v = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];

  for (let iter = 0; iter < 12; iter += 1) {
    let p = 0;
    let q = 1;
    let max = Math.abs(a[0]![1]!);
    if (Math.abs(a[0]![2]!) > max) {
      max = Math.abs(a[0]![2]!);
      p = 0;
      q = 2;
    }
    if (Math.abs(a[1]![2]!) > max) {
      p = 1;
      q = 2;
    }
    if (max < 1e-12) {
      break;
    }

    const ap = a[p]![p]!;
    const aq = a[q]![q]!;
    const phi = 0.5 * Math.atan2(2 * a[p]![q]!, aq - ap);
    const c = Math.cos(phi);
    const s = Math.sin(phi);

    for (let k = 0; k < 3; k += 1) {
      const akp = a[k]![p]!;
      const akq = a[k]![q]!;
      a[k]![p] = c * akp - s * akq;
      a[k]![q] = s * akp + c * akq;
    }
    a[p]![q] = 0;
    a[q]![p] = 0;

    for (let k = 0; k < 3; k += 1) {
      const vkp = v[k]![p]!;
      const vkq = v[k]![q]!;
      v[k]![p] = c * vkp - s * vkq;
      v[k]![q] = s * vkp + c * vkq;
    }
  }

  const pairs = [
    { value: a[0]![0]!, vector: [v[0]![0]!, v[1]![0]!, v[2]![0]!] as Vec3 },
    { value: a[1]![1]!, vector: [v[0]![1]!, v[1]![1]!, v[2]![1]!] as Vec3 },
    { value: a[2]![2]!, vector: [v[0]![2]!, v[1]![2]!, v[2]![2]!] as Vec3 },
  ].sort((left, right) => left.value - right.value);

  return {
    values: [pairs[0]!.value, pairs[1]!.value, pairs[2]!.value],
    vectors: [pairs[0]!.vector, pairs[1]!.vector, pairs[2]!.vector],
  };
}

export function principalAxesRotation(
  cov: Symmetric3,
  vertical: "smallest" | "middle" | "largest",
): Mat3 {
  const { vectors } = symmetricEigen3x3(cov);
  const smallest = normalizeVec(vectors[0]!);
  const middle = normalizeVec(vectors[1]!);
  const largest = normalizeVec(vectors[2]!);
  const up = vertical === "largest" ? largest : vertical === "smallest" ? smallest : middle;
  const side =
    vertical === "largest" ? middle : vertical === "smallest" ? largest : largest;
  const depth =
    vertical === "largest" ? smallest : vertical === "smallest" ? middle : smallest;
  return [
    side[0]!,
    side[1]!,
    side[2]!,
    up[0]!,
    up[1]!,
    up[2]!,
    depth[0]!,
    depth[1]!,
    depth[2]!,
  ];
}

function normalizeVec(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}
