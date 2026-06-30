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
const HERO_GLB_NAME = "corvo-logo-preview.glb";

const API_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const BUNDLED_HERO_GLB = path.join(API_ROOT, "seed-assets", "hero", HERO_GLB_NAME);

/** Copy committed preview GLB when STL source is unavailable (e.g. VPS deploy). */
export async function installBundledHeroLogoGlb(modelsBasePath: string): Promise<string | null> {
  try {
    await access(BUNDLED_HERO_GLB);
  } catch {
    return null;
  }

  const destDir = path.join(modelsBasePath, "3d");
  await mkdir(destDir, { recursive: true });
  await copyFile(BUNDLED_HERO_GLB, path.join(destDir, HERO_GLB_NAME));
  return HERO_LOGO_PREVIEW_URL;
}

export async function seedHeroLogo(
  env: Record<string, string | undefined> = process.env,
): Promise<string | null> {
  const sourceDir = env.SEED_MODELS_SOURCE_DIR ?? DEFAULT_SEED_MODELS_SOURCE_DIR;
  const sourcePath = path.join(sourceDir, HERO_LOGO_SOURCE_FILE);
  const config = loadConfig(env);

  try {
    await access(sourcePath);
    const destDir = path.join(config.MODEL_FILES_BASE_PATH, "3d");
    await mkdir(destDir, { recursive: true });

    const destPath = path.join(destDir, `${HERO_LOGO_DEST_STEM}.stl`);
    await copyFile(sourcePath, destPath);

    const preview = await optimizeHeroLogoPreview({
      sourcePath: destPath,
      modelsBasePath: config.MODEL_FILES_BASE_PATH,
    });

    if (preview) {
      console.log(`[seedHeroLogo] ${HERO_LOGO_PREVIEW_URL} (${preview.sizeBytes} bytes, from STL)`);
      return preview.previewUrl;
    }

    console.warn("[seedHeroLogo] Preview optimization failed — trying bundled GLB");
  } catch {
    console.warn(`[seedHeroLogo] STL missing at ${sourcePath} — trying bundled GLB`);
  }

  const bundled = await installBundledHeroLogoGlb(config.MODEL_FILES_BASE_PATH);
  if (bundled) {
    console.log(`[seedHeroLogo] ${bundled} (bundled seed-assets copy)`);
    return bundled;
  }

  console.warn("[seedHeroLogo] No STL source and no bundled GLB — hero 3D logo will not render");
  return null;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await seedHeroLogo();
}
