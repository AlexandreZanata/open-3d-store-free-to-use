export type Bbox = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
};

type MutableBbox = Bbox & { initialized: boolean };

export function bboxFromPositions(positions: Float32Array): Bbox | null {
  if (positions.length < 9) {
    return null;
  }
  const bbox = emptyBbox();
  for (let i = 0; i < positions.length; i += 3) {
    expandBbox(bbox, positions[i]!, positions[i + 1]!, positions[i + 2]!);
  }
  return bbox.initialized ? bbox : null;
}

export function bboxVolumeCm3(bbox: Bbox, unit: "mm" | "m"): number {
  const dx = Math.abs(bbox.maxX - bbox.minX);
  const dy = Math.abs(bbox.maxY - bbox.minY);
  const dz = Math.abs(bbox.maxZ - bbox.minZ);
  const raw = dx * dy * dz;
  return unit === "mm" ? raw / 1000 : raw * 1_000_000;
}

export function inferStlVolumeUnit(bbox: Bbox | null): "mm" | "m" {
  if (bbox === null) {
    return "mm";
  }
  const max = Math.max(
    Math.abs(bbox.maxX),
    Math.abs(bbox.minX),
    Math.abs(bbox.maxY),
    Math.abs(bbox.minY),
    Math.abs(bbox.maxZ),
    Math.abs(bbox.minZ),
  );
  return max > 20 ? "mm" : "m";
}

export function computeStlBbox(data: Buffer): Bbox | null {
  if (data.byteLength >= 84 && !isAsciiStl(data)) {
    return computeBinaryStlBbox(data);
  }
  return computeAsciiStlBbox(data.toString("utf8"));
}

function isAsciiStl(data: Buffer): boolean {
  const head = data.subarray(0, Math.min(80, data.byteLength)).toString("utf8").trimStart();
  return head.startsWith("solid");
}

function computeBinaryStlBbox(data: Buffer): Bbox | null {
  const triangleCount = data.readUInt32LE(80);
  const stride = triangleCount > 100_000 ? Math.ceil(triangleCount / 100_000) : 1;
  const bbox = emptyBbox();

  for (let i = 0; i < triangleCount; i += stride) {
    const triOffset = 84 + i * 50;
    if (triOffset + 50 > data.byteLength) {
      break;
    }
    for (let v = 0; v < 3; v += 1) {
      const base = triOffset + 12 + v * 12;
      expandBbox(bbox, data.readFloatLE(base), data.readFloatLE(base + 4), data.readFloatLE(base + 8));
    }
  }

  return bbox.initialized ? bbox : null;
}

function computeAsciiStlBbox(text: string): Bbox | null {
  const bbox = emptyBbox();
  const vertexPattern = /vertex\s+([-+eE.\d]+)\s+([-+eE.\d]+)\s+([-+eE.\d]+)/g;
  let match = vertexPattern.exec(text);
  while (match !== null) {
    expandBbox(bbox, Number(match[1]), Number(match[2]), Number(match[3]));
    match = vertexPattern.exec(text);
  }
  return bbox.initialized ? bbox : null;
}

function emptyBbox(): MutableBbox {
  return {
    minX: 0,
    minY: 0,
    minZ: 0,
    maxX: 0,
    maxY: 0,
    maxZ: 0,
    initialized: false,
  };
}

function expandBbox(bbox: MutableBbox, x: number, y: number, z: number): void {
  if (!bbox.initialized) {
    bbox.minX = bbox.maxX = x;
    bbox.minY = bbox.maxY = y;
    bbox.minZ = bbox.maxZ = z;
    bbox.initialized = true;
    return;
  }
  bbox.minX = Math.min(bbox.minX, x);
  bbox.minY = Math.min(bbox.minY, y);
  bbox.minZ = Math.min(bbox.minZ, z);
  bbox.maxX = Math.max(bbox.maxX, x);
  bbox.maxY = Math.max(bbox.maxY, y);
  bbox.maxZ = Math.max(bbox.maxZ, z);
}
