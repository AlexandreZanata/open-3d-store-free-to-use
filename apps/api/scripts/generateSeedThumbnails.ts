import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { seedThumbnailSpecs } from "./seedThumbnailSpecs.js";

const API_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = path.join(API_ROOT, "seed-assets", "thumbnails");

function buildThumbnailSvg(label: string, colors: [string, string]): string {
  const escaped = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="100%" stop-color="${colors[1]}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="480" fill="url(#bg)"/>
  <rect x="48" y="48" width="544" height="384" rx="24" fill="rgba(255,255,255,0.12)"/>
  <text x="320" y="250" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="42" font-weight="700" fill="#FFFFFF">${escaped}</text>
  <text x="320" y="300" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="18" font-weight="500" fill="rgba(255,255,255,0.85)">AXIS 3D Print</text>
</svg>`;
}

export async function generateSeedThumbnails(outputDir = OUTPUT_DIR): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });

  await Promise.all(
    seedThumbnailSpecs.map(async (spec) => {
      const svg = buildThumbnailSvg(spec.label, spec.colors);
      const outputPath = path.join(outputDir, spec.fileName);
      await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(outputPath);
    }),
  );
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await generateSeedThumbnails();
  console.log(`Generated ${seedThumbnailSpecs.length} seed thumbnails in ${OUTPUT_DIR}`);
}
