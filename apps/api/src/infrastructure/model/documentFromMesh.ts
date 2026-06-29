import { Document } from "@gltf-transform/core";

/** Build glTF document from triangle soup (positions in meters). */
export function documentFromMesh(positions: Float32Array, name = "Part"): Document | null {
  if (positions.length < 9) {
    return null;
  }

  const document = new Document();
  const buffer = document.createBuffer();
  const accessor = document
    .createAccessor()
    .setType("VEC3")
    .setArray(positions)
    .setBuffer(buffer);
  const primitive = document.createPrimitive().setAttribute("POSITION", accessor);
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
