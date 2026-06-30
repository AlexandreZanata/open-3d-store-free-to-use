import { stat } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { dedup, draco, normals, simplify, weld } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";

import { createGltfIo } from "./createGltfIo.js";
import { centerOnBuildPlate } from "./meshOrientationMath.js";
import { documentFromMesh } from "./documentFromMesh.js";
import { positionsToMeters } from "./documentFromMesh.js";
import { orientHeroLogoMesh } from "./orientMeshForPrintPreview.js";
import { readStlPositions } from "./readStlPositions.js";
import {
  PREVIEW_MAX_BYTES,
  type OptimizeModelPreviewResult,
} from "./optimizeModelPreview.js";

/** Read every STL triangle — stride decimation leaves holes and looks like a point cloud. */
export const HERO_LOGO_READ_MAX_TRIANGLES = Number.POSITIVE_INFINITY;

/** Target welded mesh density after meshopt simplify (~330k tris from a 1.5M STL). */
export const HERO_LOGO_SIMPLIFY_RATIO = 0.22;

export type OptimizeHeroLogoInput = {
  sourcePath: string;
  modelsBasePath: string;
};

/** High-quality Draco GLB for the desktop hero Corvo logo. */
export async function optimizeHeroLogoPreview(
  input: OptimizeHeroLogoInput,
): Promise<OptimizeModelPreviewResult | null> {
  if (!input.sourcePath.endsWith(".stl")) {
    return null;
  }

  try {
    const data = await readFile(input.sourcePath);
    const positions = readStlPositions(data, { maxTriangles: HERO_LOGO_READ_MAX_TRIANGLES });
    if (!positions) {
      return null;
    }

    const meters = positionsToMeters(positions);
    const upright = orientHeroLogoMesh(meters);
    const centered = centerOnBuildPlate(upright);
    const document = documentFromMesh(centered, "CorvoLogo");
    if (!document) {
      return null;
    }

    await MeshoptSimplifier.ready;
    await document.transform(
      weld(),
      dedup(),
      simplify({ simplifier: MeshoptSimplifier, ratio: HERO_LOGO_SIMPLIFY_RATIO, error: 0.002 }),
      normals(),
      draco({ method: "edgebreaker" }),
    );

    const io = await createGltfIo();
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
