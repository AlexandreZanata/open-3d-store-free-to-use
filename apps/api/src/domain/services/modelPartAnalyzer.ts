import type { AdminUploadMimeType, ModelPart } from "@print3d/shared-types";
import { uuidv7 } from "uuidv7";

import { formatModelPartName } from "./formatModelPartName.js";

type Bbox = { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number };

export type AnalyzeModelInput = {
  data: Buffer;
  mimeType: AdminUploadMimeType;
  filename: string;
  infillFactor: number;
  densityGCm3: number;
};

export function analyzeModelParts(input: AnalyzeModelInput): ModelPart[] {
  const stem = input.filename.replace(/\.[^.]+$/, "") || "Part";

  if (input.mimeType === "model/gltf-binary") {
    return analyzeGlb(input.data, input.infillFactor, input.densityGCm3);
  }
  if (input.mimeType === "model/stl") {
    const bbox = computeStlBbox(input.data);
    return [
      buildPart(
        formatModelPartName(stem),
        bbox,
        inferStlVolumeUnit(bbox),
        input.infillFactor,
        input.densityGCm3,
      ),
    ];
  }
  if (input.mimeType === "model/3mf") {
    return [
      buildPart(formatModelPartName(stem), null, "mm", input.infillFactor, input.densityGCm3),
    ];
  }

  return [buildPart(formatModelPartName(stem), null, "mm", input.infillFactor, input.densityGCm3)];
}

function analyzeGlb(
  data: Buffer,
  infillFactor: number,
  densityGCm3: number,
): ModelPart[] {
  const json = readGlbJsonChunk(data);
  if (json === null) {
    return [buildPart("Mesh", null, "mm", infillFactor, densityGCm3)];
  }

  const meshes = (json.meshes as Array<{ name?: string }> | undefined) ?? [];
  if (meshes.length === 0) {
    return [buildPart("Mesh", readGlbSceneBbox(json), "m", infillFactor, densityGCm3)];
  }

  return meshes.map((mesh, index) => {
    const name = mesh.name?.trim() || `Mesh ${index + 1}`;
    return buildPart(name, readGlbSceneBbox(json), "m", infillFactor, densityGCm3);
  });
}

function readGlbJsonChunk(data: Buffer): Record<string, never> | null {
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

function readGlbSceneBbox(json: Record<string, never>): Bbox | null {
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

function computeStlBbox(data: Buffer): Bbox | null {
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
  let offset = 84;
  const bbox = emptyBbox();

  for (let i = 0; i < triangleCount; i += 1) {
    if (offset + 50 > data.byteLength) {
      break;
    }
    for (let v = 0; v < 3; v += 1) {
      const base = offset + 12 + v * 12;
      expandBbox(bbox, data.readFloatLE(base), data.readFloatLE(base + 4), data.readFloatLE(base + 8));
    }
    offset += 50;
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

function inferStlVolumeUnit(bbox: Bbox | null): "mm" | "m" {
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

function buildPart(
  name: string,
  bbox: Bbox | null,
  unit: "mm" | "m",
  infillFactor: number,
  densityGCm3: number,
): ModelPart {
  const volumeCm3 = bbox === null ? null : bboxVolumeCm3(bbox, unit);
  const weightGrams =
    volumeCm3 === null ? null : Math.round(volumeCm3 * infillFactor * densityGCm3 * 10) / 10;

  return { id: uuidv7(), name, volumeCm3, weightGrams };
}

function bboxVolumeCm3(bbox: Bbox, unit: "mm" | "m"): number {
  const dx = Math.abs(bbox.maxX - bbox.minX);
  const dy = Math.abs(bbox.maxY - bbox.minY);
  const dz = Math.abs(bbox.maxZ - bbox.minZ);
  const raw = dx * dy * dz;
  return unit === "mm" ? raw / 1000 : raw * 1_000_000;
}

type MutableBbox = Bbox & { initialized: boolean };

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
