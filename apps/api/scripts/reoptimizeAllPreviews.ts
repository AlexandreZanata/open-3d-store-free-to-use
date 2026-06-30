/**
 * Regenerate every storefront `-preview.glb` from on-disk catalog sources.
 * Run on VPS deploy so orientation fixes apply without manual re-upload.
 *
 * Usage:
 *   pnpm --filter @print3d/api reoptimize-all-previews
 */
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "../src/config.js";
import { optimizeModelPreview } from "../src/infrastructure/model/optimizeModelPreview.js";
import { resolveModelUploadMime } from "../src/infrastructure/storage/resolveModelUploadMime.js";

const MODEL_EXTENSIONS = new Set([".stl", ".3mf", ".glb", ".gltf"]);
const SKIP_STEMS = new Set(["corvo-logo"]);

/** Ensure upload tree exists (fresh VPS or first deploy). */
export async function ensureModelStorageDirs(modelsBasePath: string): Promise<string> {
  const base = path.resolve(modelsBasePath);
  await mkdir(path.join(base, "3d"), { recursive: true });
  await mkdir(path.join(base, "thumbnails"), { recursive: true });
  await mkdir(path.join(base, "images"), { recursive: true });
  return path.join(base, "3d");
}

export async function reoptimizeAllPreviews(
  env: Record<string, string | undefined> = process.env,
): Promise<{ ok: number; failed: number; skipped: number }> {
  const config = loadConfig(env);
  const modelsDir = await ensureModelStorageDirs(config.MODEL_FILES_BASE_PATH);

  let entries: string[];
  try {
    entries = await readdir(modelsDir);
  } catch {
    console.log("[reoptimizeAllPreviews] models/3d unreadable — skip");
    return { ok: 0, failed: 0, skipped: 0 };
  }

  let ok = 0;
  let failed = 0;
  let skipped = 0;

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
      skipped += 1;
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

  if (ok === 0 && failed === 0) {
    console.log("[reoptimizeAllPreviews] No catalog sources in models/3d — nothing to regenerate");
  }

  return { ok, failed, skipped };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const result = await reoptimizeAllPreviews();
  console.log(
    `[reoptimizeAllPreviews] Done: ${result.ok} ok, ${result.failed} failed, ${result.skipped} skipped`,
  );
  if (result.failed > 0) {
    process.exitCode = 1;
  }
}
