import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ModelPart } from "@print3d/shared-types";
import { readFile } from "node:fs/promises";

import { loadConfig } from "../src/config.js";
import { analyzeModelParts } from "../src/domain/services/modelPartAnalyzer.js";
import { optimizeModelPreview } from "../src/infrastructure/model/optimizeModelPreview.js";
import { resolveModelUploadMime } from "../src/infrastructure/storage/resolveModelUploadMime.js";
import { BUNDLED_HERO_GLB } from "./seedHeroLogo.js";
import { DEFAULT_SEED_MODELS_SOURCE_DIR, seedModelSpecs } from "./seedModelSpecs.js";

/** E2E-critical slugs get committed GLB when STL/3MF sources are absent (CI, fresh VPS). */
const BUNDLED_CATALOG_PREVIEW_SLUGS = new Set(["custom-photo-frame", "dragon-figurine"]);

async function installBundledCatalogPreview(
  slug: string,
  modelsBasePath: string,
): Promise<string | null> {
  if (!BUNDLED_CATALOG_PREVIEW_SLUGS.has(slug)) {
    return null;
  }
  try {
    await access(BUNDLED_HERO_GLB);
  } catch {
    return null;
  }
  const destDir = path.join(modelsBasePath, "3d");
  await mkdir(destDir, { recursive: true });
  const fileName = `seed-${slug}-preview.glb`;
  await copyFile(BUNDLED_HERO_GLB, path.join(destDir, fileName));
  return `/models/3d/${fileName}`;
}

export type SeedModelOverride = {
  modelFileUrl: string;
  modelParts: ModelPart[];
  weightGrams: number | null;
};

export type SeedModelsResult = Map<string, SeedModelOverride>;

export async function seedModels(
  env: Record<string, string | undefined> = process.env,
): Promise<SeedModelsResult> {
  const sourceDir = env.SEED_MODELS_SOURCE_DIR ?? DEFAULT_SEED_MODELS_SOURCE_DIR;
  const config = loadConfig(env);
  const destDir = path.join(config.MODEL_FILES_BASE_PATH, "3d");
  await mkdir(destDir, { recursive: true });

  const overrides: SeedModelsResult = new Map();
  const infill = 0.2;
  const density = 1.24;

  for (const spec of seedModelSpecs) {
    const sourcePath = path.join(sourceDir, spec.sourceFile);
    try {
      await access(sourcePath);
    } catch {
      console.warn(`[seedModels] Missing source ${sourcePath}`);
      const bundledUrl = await installBundledCatalogPreview(
        spec.productSlug,
        config.MODEL_FILES_BASE_PATH,
      );
      if (bundledUrl) {
        overrides.set(spec.productSlug, {
          modelFileUrl: bundledUrl,
          modelParts: [],
          weightGrams: null,
        });
        console.log(`[seedModels] ${spec.productSlug} → ${bundledUrl} (bundled preview)`);
      }
      continue;
    }

    const extension = path.extname(spec.sourceFile);
    const destPath = path.join(destDir, `seed-${spec.productSlug}${extension}`);
    await copyFile(sourcePath, destPath);

    const mimeType = resolveModelUploadMime(spec.sourceFile, "application/octet-stream");
    if (!mimeType) {
      console.warn(`[seedModels] Unsupported mime for ${spec.sourceFile}`);
      continue;
    }

    const preview = await optimizeModelPreview({
      sourcePath: destPath,
      mimeType,
      modelsBasePath: config.MODEL_FILES_BASE_PATH,
    });
    if (!preview) {
      console.warn(`[seedModels] Preview optimization failed for ${spec.productSlug}`);
      continue;
    }

    const sourceData = await readFile(destPath);
    const modelParts = analyzeModelParts({
      data: sourceData,
      mimeType,
      filename: spec.sourceFile,
      infillFactor: infill,
      densityGCm3: density,
    });
    const partWeight = modelParts.reduce((sum, part) => sum + (part.weightGrams ?? 0), 0);

    overrides.set(spec.productSlug, {
      modelFileUrl: preview.previewUrl,
      modelParts,
      weightGrams: partWeight > 0 ? partWeight : null,
    });
    console.log(`[seedModels] ${spec.productSlug} → ${preview.previewUrl} (${preview.sizeBytes} bytes)`);
  }

  return overrides;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const overrides = await seedModels();
  console.log(`Seeded ${overrides.size} catalog model previews.`);
}
