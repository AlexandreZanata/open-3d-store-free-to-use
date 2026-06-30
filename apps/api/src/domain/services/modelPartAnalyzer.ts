import type { AdminUploadMimeType, ModelPart } from "@print3d/shared-types";
import { uuidv7 } from "uuidv7";

import { formatModelPartName } from "./formatModelPartName.js";
import {
  bboxFromPositions,
  bboxVolumeCm3,
  computeStlBbox,
  inferStlVolumeUnit,
  type Bbox,
} from "./modelPartBbox.js";
import { readGlbJsonChunk, readGlbSceneBbox } from "./modelPartGlb.js";
import { read3mfPartMeshes } from "../../infrastructure/model/read3mfPartMeshes.js";

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
    const slices = read3mfPartMeshes(input.data);
    if (!slices || slices.length === 0) {
      return [buildPart(formatModelPartName(stem), null, "mm", input.infillFactor, input.densityGCm3)];
    }
    return slices.map((slice, index) =>
      buildPart(
        formatModelPartName(slice.name, index),
        bboxFromPositions(slice.positions),
        "mm",
        input.infillFactor,
        input.densityGCm3,
        slice.defaultColorHex,
      ),
    );
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

function buildPart(
  name: string,
  bbox: Bbox | null,
  unit: "mm" | "m",
  infillFactor: number,
  densityGCm3: number,
  defaultColorHex?: string,
): ModelPart {
  const volumeCm3 = bbox === null ? null : bboxVolumeCm3(bbox, unit);
  const weightGrams =
    volumeCm3 === null ? null : Math.round(volumeCm3 * infillFactor * densityGCm3);

  return {
    id: uuidv7(),
    name,
    volumeCm3,
    weightGrams,
    ...(defaultColorHex ? { defaultColorHex: defaultColorHex.toUpperCase() } : {}),
  };
}
