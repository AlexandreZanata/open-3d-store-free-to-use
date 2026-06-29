import { Document, type GLTF } from "@gltf-transform/core";

/** Studio gray — matches storefront ModelViewer default. */
const PREVIEW_BASE_COLOR: [number, number, number, number] = [0.608, 0.631, 0.686, 1];

/**
 * Build indexed TRIANGLES glTF from triangle soup (meters).
 * Khronos glTF requires indexed primitives + material for solid Draco previews.
 */
export function documentFromMesh(positions: Float32Array, name = "Part"): Document | null {
  if (positions.length < 9) {
    return null;
  }

  const vertexCount = positions.length / 3;
  const indices = new Uint32Array(vertexCount);
  for (let i = 0; i < vertexCount; i += 1) {
    indices[i] = i;
  }

  const document = new Document();
  const buffer = document.createBuffer();
  const positionAccessor = document
    .createAccessor()
    .setType("VEC3")
    .setArray(positions)
    .setBuffer(buffer);
  const indexAccessor = document
    .createAccessor()
    .setType("SCALAR")
    .setArray(indices)
    .setBuffer(buffer);
  const material = document
    .createMaterial()
    .setBaseColorFactor(PREVIEW_BASE_COLOR)
    .setMetallicFactor(0.12)
    .setRoughnessFactor(0.62)
    .setDoubleSided(true);

  const primitive = document
    .createPrimitive()
    .setMode(4 as GLTF.MeshPrimitiveMode)
    .setAttribute("POSITION", positionAccessor)
    .setIndices(indexAccessor)
    .setMaterial(material);
  const mesh = document.createMesh(name).addPrimitive(primitive);
  document.createScene().addChild(document.createNode().setMesh(mesh));
  return document;
}

/** STL / 3MF store millimeters; glTF uses meters. */
export function millimetersToMeters(mm: Float32Array): Float32Array {
  const meters = new Float32Array(mm.length);
  for (let i = 0; i < mm.length; i += 1) {
    meters[i] = mm[i]! / 1000;
  }
  return meters;
}

/** Heuristic: coords above ~20 are typical millimeter print sizes; smaller values are already meters. */
export function positionsToMeters(positions: Float32Array): Float32Array {
  let maxAbs = 0;
  for (let i = 0; i < positions.length; i += 1) {
    maxAbs = Math.max(maxAbs, Math.abs(positions[i]!));
  }
  return maxAbs > 20 ? millimetersToMeters(positions) : positions;
}
