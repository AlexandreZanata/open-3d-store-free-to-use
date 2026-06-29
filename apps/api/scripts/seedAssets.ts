import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "../src/config.js";
import { generateSeedThumbnails } from "./generateSeedThumbnails.js";
import { seedThumbnailSpecs } from "./seedThumbnailSpecs.js";

const API_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(API_ROOT, "seed-assets", "thumbnails");

async function ensureSourceThumbnails(): Promise<void> {
  try {
    const entries = await fs.readdir(SOURCE_DIR);
    const webpFiles = entries.filter((name) => name.endsWith(".webp"));
    if (webpFiles.length >= seedThumbnailSpecs.length) {
      return;
    }
  } catch {
    // missing directory — generate below
  }

  await generateSeedThumbnails(SOURCE_DIR);
}

export async function seedAssets(env: Record<string, string | undefined> = process.env): Promise<void> {
  await ensureSourceThumbnails();

  const config = loadConfig(env);
  const destDir = path.join(config.MODEL_FILES_BASE_PATH, "thumbnails");
  await fs.mkdir(destDir, { recursive: true });

  await Promise.all(
    seedThumbnailSpecs.map(async (spec) => {
      const sourcePath = path.join(SOURCE_DIR, spec.fileName);
      const destPath = path.join(destDir, spec.fileName);
      await fs.copyFile(sourcePath, destPath);
    }),
  );
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await seedAssets();
  console.log("Seed assets copied to MODEL_FILES_BASE_PATH/thumbnails/");
}
