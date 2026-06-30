import type { Accessor, Document, Primitive } from "@gltf-transform/core";

import type { RawPartMesh } from "./read3mfPartMeshes.js";

/** Flatten each glTF mesh primitive into a separate triangle soup (meters). */
export function extractDocumentPartMeshes(document: Document): RawPartMesh[] {
  const parts: RawPartMesh[] = [];

  for (const mesh of document.getRoot().listMeshes()) {
    const positions: number[] = [];
    for (const primitive of mesh.listPrimitives()) {
      appendPrimitivePositions(primitive, positions);
    }
    if (positions.length >= 9) {
      parts.push({
        name: mesh.getName() || `Part ${parts.length + 1}`,
        positions: new Float32Array(positions),
      });
    }
  }

  return parts;
}

/** Flatten indexed glTF mesh primitives into triangle soup (meters). */
export function extractDocumentPositions(document: Document): Float32Array | null {
  const positions: number[] = [];

  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      appendPrimitivePositions(primitive, positions);
    }
  }

  return positions.length >= 9 ? new Float32Array(positions) : null;
}

function readFloatArray(accessor: Accessor | null): Float32Array | null {
  if (!accessor) {
    return null;
  }
  const array = accessor.getArray() as Float32Array | null;
  if (!array) {
    return null;
  }
  return array instanceof Float32Array ? array : Float32Array.from(array);
}

function readIndexArray(accessor: Accessor | null): Uint32Array | null {
  if (!accessor) {
    return null;
  }
  const array = accessor.getArray() as Uint16Array | Uint32Array | null;
  if (!array) {
    return null;
  }
  if (array instanceof Uint32Array) {
    return array;
  }
  if (array instanceof Uint16Array) {
    return Uint32Array.from(array);
  }
  return Uint32Array.from(array);
}

function appendPrimitivePositions(primitive: Primitive, out: number[]): void {
  const vertices = readFloatArray(primitive.getAttribute("POSITION"));
  if (!vertices) {
    return;
  }

  const indices = readIndexArray(primitive.getIndices());
  if (!indices) {
    for (let i = 0; i < vertices.length; i += 1) {
      out.push(vertices[i]!);
    }
    return;
  }

  for (let i = 0; i < indices.length; i += 1) {
    const vertex = indices[i]! * 3;
    out.push(vertices[vertex]!, vertices[vertex + 1]!, vertices[vertex + 2]!);
  }
}
