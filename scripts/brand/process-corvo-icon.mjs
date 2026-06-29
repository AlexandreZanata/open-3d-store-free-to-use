#!/usr/bin/env node
/**
 * Extracts the crow mark from ICONE.png (no text, transparent background).
 * Outputs brand assets for apps/web and apps/admin public folders.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const src = path.join(repoRoot, "ICONE.png");
const CROP_HEIGHT = 620;
const WHITE_THRESHOLD = 245;

function removeWhiteBackground(buffer) {
  for (let i = 0; i < buffer.length; i += 4) {
    const r = buffer[i];
    const g = buffer[i + 1];
    const b = buffer[i + 2];
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      buffer[i + 3] = 0;
    }
  }
}

async function buildCrowPng() {
  const { data, info } = await sharp(src)
    .extract({ left: 0, top: 0, width: 1254, height: CROP_HEIGHT })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  removeWhiteBackground(data);
  return sharp(data, { raw: info }).trim().png().toBuffer();
}

const crow = await buildCrowPng();

const brandTargets = [
  path.join(repoRoot, "apps/web/public/brand/corvo-icon.png"),
  path.join(repoRoot, "apps/admin/public/brand/corvo-icon.png"),
];

for (const target of brandTargets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await fs.promises.writeFile(target, crow);
}

const faviconTargets = [
  path.join(repoRoot, "apps/web/public/favicon.png"),
  path.join(repoRoot, "apps/admin/public/favicon.png"),
];

for (const target of faviconTargets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await sharp(crow)
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(target);
}

await sharp(crow)
  .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(repoRoot, "apps/web/public/favicon-32.png"));

await sharp(crow)
  .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(repoRoot, "apps/web/public/apple-touch-icon.png"));

const meta = await sharp(crow).metadata();
console.log(`Corvo icon ${meta.width}x${meta.height} written to web and admin public/`);
