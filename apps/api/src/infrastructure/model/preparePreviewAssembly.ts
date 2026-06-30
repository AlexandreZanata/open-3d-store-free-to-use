import { positionsToMeters } from "./documentFromMesh.js";
import { orientSlicerExportForPreview } from "./orientMeshForPrintPreview.js";
import type { RawPartMesh } from "./read3mfPartMeshes.js";

/** Unit-normalize and orient a multi-body assembly without merging meshes. */
export function preparePreviewAssembly(parts: RawPartMesh[]): RawPartMesh[] {
  if (parts.length === 0) {
    return parts;
  }

  const meters = parts.map((part) => ({
    ...part,
    positions: positionsToMeters(part.positions),
  }));
  const lengths = meters.map((part) => part.positions.length);
  const combined = concatPositions(meters.map((part) => part.positions));
  const oriented = orientSlicerExportForPreview(combined);

  let offset = 0;
  return meters.map((part, index) => {
    const length = lengths[index]!;
    const slice = oriented.subarray(offset, offset + length);
    offset += length;
    return { ...part, positions: new Float32Array(slice) };
  });
}

function concatPositions(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combined = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }
  return combined;
}
