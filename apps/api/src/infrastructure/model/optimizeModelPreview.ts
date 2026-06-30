import { stat } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Document } from "@gltf-transform/core";
import { dedup, draco, normals, simplify, weld } from "@gltf-transform/functions";
import type { AdminUploadMimeType } from "@print3d/shared-types";
import { MeshoptSimplifier } from "meshoptimizer";

import { createGltfIo } from "./createGltfIo.js";
import { documentFromMesh } from "./documentFromMesh.js";
import { documentFromPartMeshes } from "./documentFromPartMeshes.js";
import { extractDocumentPartMeshes, extractDocumentPositions } from "./extractDocumentPositions.js";
import { preparePreviewAssembly } from "./preparePreviewAssembly.js";
import { preparePreviewMesh } from "./preparePreviewMesh.js";
import { read3mfPartMeshes } from "./read3mfPartMeshes.js";
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

    await runOptimizationPipeline(document, { preserveDetail: shouldPreserveDetail(document) });

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
    const prepared = await preparePreviewMesh(positions, { source: "stl" });
    return documentFromMesh(prepared);
  }

  if (input.mimeType === "model/3mf") {
    const data = input.sourceData ?? (await readFile(input.sourcePath));
    const rawParts = read3mfPartMeshes(data);
    if (!rawParts || rawParts.length === 0) {
      return null;
    }
    if (rawParts.length === 1 && !rawParts[0]!.defaultColorHex) {
      const prepared = await preparePreviewMesh(rawParts[0]!.positions, { source: "3mf" });
      return documentFromMesh(prepared);
    }
    const prepared = preparePreviewAssembly(rawParts);
    return documentFromPartMeshes(prepared);
  }

  if (input.mimeType === "model/gltf-binary" || input.mimeType === "model/gltf+json") {
    const source = await io.read(input.sourcePath);
    const rawParts = extractDocumentPartMeshes(source);
    if (rawParts.length > 1) {
      const prepared = preparePreviewAssembly(rawParts);
      return documentFromPartMeshes(prepared);
    }
    const positions = extractDocumentPositions(source);
    if (!positions) {
      return null;
    }
    const prepared = await preparePreviewMesh(positions, { source: "glb" });
    return documentFromMesh(prepared);
  }

  return null;
}

async function runOptimizationPipeline(
  document: Document,
  options: { preserveDetail?: boolean } = {},
): Promise<void> {
  await MeshoptSimplifier.ready;
  const ratio = options.preserveDetail ? 0.95 : 0.25;
  const error = options.preserveDetail ? 0.0005 : 0.01;
  await document.transform(
    weld(),
    dedup(),
    simplify({ simplifier: MeshoptSimplifier, ratio, error }),
    normals(),
    draco({ method: "edgebreaker" }),
  );
}

function shouldPreserveDetail(document: Document): boolean {
  return document.getRoot().listMeshes().length > 1;
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
