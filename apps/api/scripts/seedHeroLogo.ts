import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "../src/config.js";
import { optimizeHeroLogoPreview } from "../src/infrastructure/model/optimizeHeroLogoPreview.js";
import { DEFAULT_SEED_MODELS_SOURCE_DIR } from "./seedModelSpecs.js";

/** Public GLB served at GET /models/3d/corvo-logo-preview.glb */
export const HERO_LOGO_PREVIEW_URL = "/models/3d/corvo-logo-preview.glb";

const HERO_LOGO_SOURCE_FILE = "16cc56c8094335eec1baddcd7a39f5b5(1).stl";
const HERO_LOGO_DEST_STEM = "corvo-logo";

export async function seedHeroLogo(
  env: Record<string, string | undefined> = process.env,
): Promise<string | null> {
  const sourceDir = env.SEED_MODELS_SOURCE_DIR ?? DEFAULT_SEED_MODELS_SOURCE_DIR;
  const sourcePath = path.join(sourceDir, HERO_LOGO_SOURCE_FILE);

  try {
    await access(sourcePath);
  } catch {
    console.warn(`[seedHeroLogo] Skipping: missing ${sourcePath}`);
    return null;
  }

  const config = loadConfig(env);
  const destDir = path.join(config.MODEL_FILES_BASE_PATH, "3d");
  await mkdir(destDir, { recursive: true });

  const destPath = path.join(destDir, `${HERO_LOGO_DEST_STEM}.stl`);
  await copyFile(sourcePath, destPath);

  const preview = await optimizeHeroLogoPreview({
    sourcePath: destPath,
    modelsBasePath: config.MODEL_FILES_BASE_PATH,
  });

  if (!preview) {
    console.warn("[seedHeroLogo] Preview optimization failed");
    return null;
  }

  console.log(`[seedHeroLogo] ${HERO_LOGO_PREVIEW_URL} (${preview.sizeBytes} bytes)`);
  return preview.previewUrl;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await seedHeroLogo();
}
