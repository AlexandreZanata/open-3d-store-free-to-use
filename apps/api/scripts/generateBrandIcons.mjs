#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(apiRoot, "../..");
const src = path.join(repoRoot, "assets/brand/corvo-logo-source.png");
const WHITE_THRESHOLD = 245;
const LIGHT_TAB_BG = { r: 250, g: 250, b: 250, alpha: 1 };
const FAVICON_SIZES = [48, 64, 96];
const FAVICON_INSET_RATIO = 0.12;

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

/** Flat silhouette — opaque pixels become one solid color (black or white). */
function monochromePixels(buffer, color) {
  const [r, g, b] = color;
  for (let i = 0; i < buffer.length; i += 4) {
    if (buffer[i + 3] === 0) continue;
    buffer[i] = r;
    buffer[i + 1] = g;
    buffer[i + 2] = b;
    buffer[i + 3] = 255;
  }
}

async function buildLogoPng() {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  removeWhiteBackground(data);
  return sharp(data, { raw: info }).trim().png().toBuffer();
}

async function buildMonochromeLogo(logo, color) {
  const { data, info } = await sharp(logo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  monochromePixels(data, color);
  return sharp(data, { raw: info }).png().toBuffer();
}

async function writeFavicon(logo, targetPath, size) {
  const inset = Math.max(3, Math.round(size * FAVICON_INSET_RATIO));
  const inner = size - inset * 2;
  await sharp(logo)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: inset,
      bottom: inset,
      left: inset,
      right: inset,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(targetPath);
}

async function writeFaviconSvg(lightPngPath, darkPngPath, targetPath) {
  const lightB64 = (await fs.promises.readFile(lightPngPath)).toString("base64");
  const darkB64 = (await fs.promises.readFile(darkPngPath)).toString("base64");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <style>
    .favicon-light { display: block; }
    .favicon-dark { display: none; }
    @media (prefers-color-scheme: dark) {
      .favicon-light { display: none; }
      .favicon-dark { display: block; }
    }
  </style>
  <image class="favicon-light" width="48" height="48" href="data:image/png;base64,${lightB64}" />
  <image class="favicon-dark" width="48" height="48" href="data:image/png;base64,${darkB64}" />
</svg>
`;
  await fs.promises.writeFile(targetPath, svg);
}

async function writeAppleTouchIcon(monochromeLight, targetPath) {
  const size = 180;
  const inset = Math.round(size * 0.15);
  const inner = size - inset * 2;
  await sharp(monochromeLight)
    .resize(inner, inner, { fit: "contain", background: LIGHT_TAB_BG })
    .extend({
      top: inset,
      bottom: inset,
      left: inset,
      right: inset,
      background: LIGHT_TAB_BG,
    })
    .png()
    .toFile(targetPath);
}

const logo = await buildLogoPng();
const faviconLight = await buildMonochromeLogo(logo, [0, 0, 0]);
const faviconDark = await buildMonochromeLogo(logo, [255, 255, 255]);

for (const app of ["web", "admin"]) {
  const publicDir = path.join(repoRoot, "apps", app, "public");
  const brandDir = path.join(publicDir, "brand");
  fs.mkdirSync(brandDir, { recursive: true });
  await fs.promises.writeFile(path.join(brandDir, "corvo-logo.png"), logo);

  const light48 = path.join(publicDir, "favicon-light.png");
  const dark48 = path.join(publicDir, "favicon-dark.png");

  for (const size of FAVICON_SIZES) {
    const suffix = size === 48 ? "" : `-${size}`;
    await writeFavicon(faviconLight, path.join(publicDir, `favicon-light${suffix}.png`), size);
    await writeFavicon(faviconDark, path.join(publicDir, `favicon-dark${suffix}.png`), size);
  }

  await writeFavicon(faviconLight, path.join(publicDir, "favicon.png"), 48);
  await writeFaviconSvg(light48, dark48, path.join(publicDir, "favicon.svg"));
}

await writeAppleTouchIcon(faviconLight, path.join(repoRoot, "apps/web/public/apple-touch-icon.png"));

const meta = await sharp(logo).metadata();
console.log(
  `Corvo logo + SVG/PNG tab favicons ${meta.width}x${meta.height} written to web and admin public/`,
);
