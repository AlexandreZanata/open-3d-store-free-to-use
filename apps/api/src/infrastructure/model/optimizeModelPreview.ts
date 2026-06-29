import { stat } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Document } from "@gltf-transform/core";
import { dedup, draco, normals, simplify, weld } from "@gltf-transform/functions";
import type { AdminUploadMimeType } from "@print3d/shared-types";
import { MeshoptSimplifier } from "meshoptimizer";

import { createGltfIo } from "./createGltfIo.js";
import { documentFromMesh } from "./documentFromMesh.js";
import { preparePreviewMesh } from "./preparePreviewMesh.js";
import { read3mfMesh } from "./read3mfMesh.js";
import { readStlPositions } from "./readStlPositions.js";

/** Uniform stride while parsing huge STL files (keeps preview worker fast). */
const PREVIEW_READ_MAX_TRIANGLES = 120_000;

/** Contract: docs/features/3d-viewer.md — browser preview limits */
export const PREVIEW_MAX_BYTES = 20 * 1024 * 1024;
export const PREVIEW_MAX_VERTICES = 600_000;

export type OptimizeModelPreviewInput = {
  sourcePath: string;
  mimeType: AdminUploadMimeType;
  modelsBasePath: string;
  /** When set, avoids a second disk read (upload worker). */
  sourceData?: Buffer;
};

export type OptimizeModelPreviewResult = {
  previewPath: string;
  previewUrl: string;
  sizeBytes: number;
};

/** Convert STL / GLB / GLTF / 3MF to Draco-compressed GLB for in-browser preview. */
export async function optimizeModelPreview(
  input: OptimizeModelPreviewInput,
): Promise<OptimizeModelPreviewResult | null> {
  if (input.sourcePath.endsWith("-preview.glb")) {
    return null;
  }

  try {
    const io = await createGltfIo();
    const document = await loadDocument(io, input);
    if (document === null) {
      return null;
    }

    await runOptimizationPipeline(document);

    const previewPath = buildPreviewPath(input.sourcePath);
    await io.write(previewPath, document);

    const previewStat = await stat(previewPath);
    if (previewStat.size > PREVIEW_MAX_BYTES) {
      return null;
    }

    return {
      previewPath,
      previewUrl: toPublicUrl(input.modelsBasePath, previewPath),
      sizeBytes: previewStat.size,
    };
  } catch {
    return null;
  }
}

async function loadDocument(
  io: Awaited<ReturnType<typeof createGltfIo>>,
  input: OptimizeModelPreviewInput,
): Promise<Document | null> {
  if (input.mimeType === "model/stl") {
    const data = input.sourceData ?? (await readFile(input.sourcePath));
    const positions = readStlPositions(data, { maxTriangles: PREVIEW_READ_MAX_TRIANGLES });
    if (!positions) {
      return null;
    }
    const prepared = await preparePreviewMesh(positions);
    return documentFromMesh(prepared);
  }

  if (input.mimeType === "model/3mf") {
    const data = input.sourceData ?? (await readFile(input.sourcePath));
    const positions = read3mfMesh(data);
    if (!positions) {
      return null;
    }
    const prepared = await preparePreviewMesh(positions);
    return documentFromMesh(prepared);
  }

  if (input.mimeType === "model/gltf-binary" || input.mimeType === "model/gltf+json") {
    return io.read(input.sourcePath);
  }

  return null;
}

async function runOptimizationPipeline(document: Document): Promise<void> {
  await MeshoptSimplifier.ready;
  await document.transform(
    weld(),
    dedup(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.25, error: 0.01 }),
    normals(),
    draco({ method: "edgebreaker" }),
  );
}

function buildPreviewPath(sourcePath: string): string {
  const dir = path.dirname(sourcePath);
  const stem = path.basename(sourcePath, path.extname(sourcePath));
  return path.join(dir, `${stem}-preview.glb`);
}

function toPublicUrl(modelsBasePath: string, absolutePath: string): string {
  const relative = path
    .relative(path.resolve(modelsBasePath), path.resolve(absolutePath))
    .replace(/\\/g, "/");
  return `/models/${relative}`;
}
