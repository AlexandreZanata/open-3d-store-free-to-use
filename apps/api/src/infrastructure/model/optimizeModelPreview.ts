import { stat } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { Document } from "@gltf-transform/core";
import { dedup, draco, meshopt, simplify, weld } from "@gltf-transform/functions";
import type { AdminUploadMimeType } from "@print3d/shared-types";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

import { createGltfIo } from "./createGltfIo.js";
import { readStlPositions } from "./readStlPositions.js";

/** Contract: docs/features/3d-viewer.md — browser preview limits */
export const PREVIEW_MAX_BYTES = 20 * 1024 * 1024;
export const PREVIEW_MAX_VERTICES = 600_000;

export type OptimizeModelPreviewInput = {
  sourcePath: string;
  mimeType: AdminUploadMimeType;
  modelsBasePath: string;
};

export type OptimizeModelPreviewResult = {
  previewPath: string;
  previewUrl: string;
  sizeBytes: number;
};

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
    const data = await readFile(input.sourcePath);
    return documentFromStl(data);
  }

  if (input.mimeType === "model/gltf-binary" || input.mimeType === "model/gltf+json") {
    return io.read(input.sourcePath);
  }

  return null;
}

function documentFromStl(data: Buffer): Document | null {
  const positions = readStlPositions(data);
  if (positions === null || positions.length === 0) {
    return null;
  }

  const meters = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 1) {
    meters[i] = positions[i]! / 1000;
  }

  const document = new Document();
  const buffer = document.createBuffer();
  const accessor = document
    .createAccessor()
    .setType("VEC3")
    .setArray(meters)
    .setBuffer(buffer);
  const primitive = document.createPrimitive().setAttribute("POSITION", accessor);
  const mesh = document.createMesh("Part").addPrimitive(primitive);
  document.createScene().addChild(document.createNode().setMesh(mesh));
  return document;
}

async function runOptimizationPipeline(document: Document): Promise<void> {
  await document.transform(weld({}), dedup());

  let ratio = 0.5;
  for (let pass = 0; pass < 6; pass += 1) {
    if (countVertices(document) <= PREVIEW_MAX_VERTICES) {
      break;
    }
    await document.transform(
      simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.0001 }),
    );
    ratio *= 0.5;
  }

  await document.transform(draco({ method: "edgebreaker" }), meshopt({ encoder: MeshoptEncoder }));
}

function countVertices(document: Document): number {
  let total = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const position = primitive.getAttribute("POSITION");
      if (position) {
        total += position.getCount();
      }
    }
  }
  return total;
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
