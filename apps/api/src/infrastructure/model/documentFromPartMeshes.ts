import { Document, type GLTF } from "@gltf-transform/core";

import type { RawPartMesh } from "./read3mfPartMeshes.js";

/** Studio gray — matches storefront ModelViewer default. */
const PREVIEW_BASE_COLOR: [number, number, number, number] = [0.608, 0.631, 0.686, 1];

function hexToBaseColor(hex: string): [number, number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255, 1];
}

/** Build indexed TRIANGLES glTF with one mesh + material per printable part. */
export function documentFromPartMeshes(parts: RawPartMesh[]): Document | null {
  if (parts.length === 0) {
    return null;
  }

  const document = new Document();
  const buffer = document.createBuffer();
  const scene = document.createScene();

  for (const part of parts) {
    if (part.positions.length < 9) {
      continue;
    }
    const baseColor = part.defaultColorHex ? hexToBaseColor(part.defaultColorHex) : PREVIEW_BASE_COLOR;
    const vertexCount = part.positions.length / 3;
    const indices = new Uint32Array(vertexCount);
    for (let i = 0; i < vertexCount; i += 1) {
      indices[i] = i;
    }
    const positionAccessor = document
      .createAccessor()
      .setType("VEC3")
      .setArray(part.positions)
      .setBuffer(buffer);
    const indexAccessor = document
      .createAccessor()
      .setType("SCALAR")
      .setArray(indices)
      .setBuffer(buffer);
    const material = document
      .createMaterial()
      .setBaseColorFactor(baseColor)
      .setMetallicFactor(0.12)
      .setRoughnessFactor(0.62)
      .setDoubleSided(true);
    const primitive = document
      .createPrimitive()
      .setMode(4 as GLTF.MeshPrimitiveMode)
      .setAttribute("POSITION", positionAccessor)
      .setIndices(indexAccessor)
      .setMaterial(material);
    const mesh = document.createMesh(part.name).addPrimitive(primitive);
    scene.addChild(document.createNode(part.name).setMesh(mesh));
  }

  return scene.listChildren().length > 0 ? document : null;
}
