import type { Bbox } from "./modelPartBbox.js";

export function readGlbJsonChunk(data: Buffer): Record<string, never> | null {
  if (data.byteLength < 20 || data.toString("ascii", 0, 4) !== "glTF") {
    return null;
  }

  let offset = 12;
  while (offset + 8 <= data.byteLength) {
    const chunkLength = data.readUInt32LE(offset);
    const chunkType = data.toString("ascii", offset + 4, offset + 8);
    offset += 8;
    if (chunkType === "JSON") {
      const jsonText = data.subarray(offset, offset + chunkLength).toString("utf8");
      return JSON.parse(jsonText) as Record<string, never>;
    }
    offset += chunkLength;
  }

  return null;
}

export function readGlbSceneBbox(json: Record<string, never>): Bbox | null {
  const accessors = json.accessors as Array<{ min?: number[]; max?: number[] }> | undefined;
  const first = accessors?.find((a) => Array.isArray(a.min) && Array.isArray(a.max));
  if (!first?.min || !first.max || first.min.length < 3 || first.max.length < 3) {
    return null;
  }

  return {
    minX: first.min[0]!,
    minY: first.min[1]!,
    minZ: first.min[2]!,
    maxX: first.max[0]!,
    maxY: first.max[1]!,
    maxZ: first.max[2]!,
  };
}
