#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(apiRoot, "../..");
const src = path.join(repoRoot, "assets/brand/corvo-logo-source.png");
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

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
removeWhiteBackground(data);
const logo = await sharp(data, { raw: info }).trim().png().toBuffer();

for (const app of ["web", "admin"]) {
  const target = path.join(repoRoot, "apps", app, "public/brand/corvo-logo.png");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await fs.promises.writeFile(target, logo);
}

for (const app of ["web", "admin"]) {
  await sharp(logo)
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(repoRoot, "apps", app, "public/favicon.png"));
}

await sharp(logo)
  .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(repoRoot, "apps/web/public/favicon-32.png"));

await sharp(logo)
  .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(repoRoot, "apps/web/public/apple-touch-icon.png"));

const meta = await sharp(logo).metadata();
console.log(`Corvo logo ${meta.width}x${meta.height} written to web and admin public/`);
