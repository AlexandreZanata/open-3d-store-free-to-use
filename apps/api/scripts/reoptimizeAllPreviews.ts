/**
 * Regenerate every storefront `-preview.glb` from on-disk catalog sources.
 * Run on VPS deploy so orientation fixes apply without manual re-upload.
 *
 * Usage:
 *   pnpm --filter @print3d/api reoptimize-all-previews
 */
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "../src/config.js";
import { optimizeModelPreview } from "../src/infrastructure/model/optimizeModelPreview.js";
import { resolveModelUploadMime } from "../src/infrastructure/storage/resolveModelUploadMime.js";

const MODEL_EXTENSIONS = new Set([".stl", ".3mf", ".glb", ".gltf"]);
const SKIP_STEMS = new Set(["corvo-logo"]);

export async function reoptimizeAllPreviews(
  env: Record<string, string | undefined> = process.env,
): Promise<{ ok: number; failed: number }> {
  const config = loadConfig(env);
  const modelsDir = path.join(config.MODEL_FILES_BASE_PATH, "3d");
  const entries = await readdir(modelsDir);
  let ok = 0;
  let failed = 0;

  for (const name of entries) {
    if (name.endsWith("-preview.glb")) {
      continue;
    }

    const extension = path.extname(name).toLowerCase();
    if (!MODEL_EXTENSIONS.has(extension)) {
      continue;
    }

    const stem = path.basename(name, extension);
    if (SKIP_STEMS.has(stem)) {
      continue;
    }

    const sourcePath = path.join(modelsDir, name);
    const mimeType = resolveModelUploadMime(name, "application/octet-stream");
    if (!mimeType) {
      failed += 1;
      console.warn(`[reoptimizeAllPreviews] Skip unsupported ${name}`);
      continue;
    }

    const preview = await optimizeModelPreview({
      sourcePath,
      mimeType,
      modelsBasePath: config.MODEL_FILES_BASE_PATH,
    });

    if (!preview) {
      failed += 1;
      console.warn(`[reoptimizeAllPreviews] Failed ${name}`);
      continue;
    }

    ok += 1;
    console.log(`[reoptimizeAllPreviews] ${name} → ${preview.previewUrl} (${preview.sizeBytes} bytes)`);
  }

  return { ok, failed };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const result = await reoptimizeAllPreviews();
  console.log(`[reoptimizeAllPreviews] Done: ${result.ok} ok, ${result.failed} failed`);
  if (result.failed > 0) {
    process.exitCode = 1;
  }
}
