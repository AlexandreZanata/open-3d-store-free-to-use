import { read3mfPartMeshes } from "./read3mfPartMeshes.js";

/** Extract triangle soup (mm units) from a Bambu / 3MF OPC archive. */
export function read3mfMesh(data: Buffer): Float32Array | null {
  const parts = read3mfPartMeshes(data);
  if (!parts) {
    return null;
  }
  const total = parts.reduce((sum, part) => sum + part.positions.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const part of parts) {
    merged.set(part.positions, offset);
    offset += part.positions.length;
  }
  return merged.length > 0 ? merged : null;
}
