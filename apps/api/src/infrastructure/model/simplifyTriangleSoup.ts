import { MeshoptSimplifier } from "meshoptimizer";

const POSITION_STRIDE = 12;

/** Weld + simplify triangle soup before glTF encoding (faster than multi-pass gltf-transform). */
export async function simplifyTriangleSoup(
  positions: Float32Array,
  maxVertices: number,
): Promise<Float32Array> {
  const soupVertexCount = positions.length / 3;
  if (soupVertexCount <= maxVertices) {
    return positions;
  }

  await MeshoptSimplifier.ready;

  const remap = MeshoptSimplifier.generatePositionRemap(positions, POSITION_STRIDE);
  const uniquePositions = new Float32Array(remap.length * 3);
  for (let i = 0; i < soupVertexCount; i += 1) {
    const dst = remap[i]! * 3;
    const src = i * 3;
    uniquePositions[dst] = positions[src]!;
    uniquePositions[dst + 1] = positions[src + 1]!;
    uniquePositions[dst + 2] = positions[src + 2]!;
  }

  const indices = new Uint32Array(soupVertexCount);
  for (let i = 0; i < soupVertexCount; i += 1) {
    indices[i] = remap[i]!;
  }

  if (remap.length <= maxVertices) {
    return soupFromIndices(uniquePositions, indices, indices.length);
  }

  const targetIndexCount = Math.max(3, Math.floor(maxVertices * 3 * 0.98));
  const [simplified, indexCount] = MeshoptSimplifier.simplify(
    indices,
    uniquePositions,
    POSITION_STRIDE,
    targetIndexCount,
    0.01,
  );

  return soupFromIndices(uniquePositions, simplified, indexCount);
}

function soupFromIndices(
  uniquePositions: Float32Array,
  indices: Uint32Array,
  indexCount: number,
): Float32Array {
  const triangleCount = Math.floor(indexCount / 3);
  const soup = new Float32Array(triangleCount * 9);
  for (let tri = 0; tri < triangleCount; tri += 1) {
    const dst = tri * 9;
    for (let corner = 0; corner < 3; corner += 1) {
      const src = indices[tri * 3 + corner]! * 3;
      soup[dst + corner * 3] = uniquePositions[src]!;
      soup[dst + corner * 3 + 1] = uniquePositions[src + 1]!;
      soup[dst + corner * 3 + 2] = uniquePositions[src + 2]!;
    }
  }
  return soup;
}
