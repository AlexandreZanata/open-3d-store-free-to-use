/**
 * Re-optimize an on-disk model and optionally update a product's modelFileUrl.
 *
 * Usage:
 *   pnpm --filter @print3d/api exec tsx --env-file=.env scripts/reoptimizeModel.ts custom-photo-frame
 */
import path from "node:path";
import { access } from "node:fs/promises";

import { eq } from "drizzle-orm";

import { loadConfig } from "../src/config.js";
import { createDb } from "../src/infrastructure/db/client.js";
import { products } from "../src/infrastructure/db/schema.js";
import { CacheService } from "../src/infrastructure/cache/CacheService.js";
import { createRedisClient } from "../src/infrastructure/cache/redis.js";
import { productCacheKey } from "../src/application/cache/cacheKeys.js";
import { LocalFileStorage } from "../src/infrastructure/storage/LocalFileStorage.js";
import { optimizeModelPreview } from "../src/infrastructure/model/optimizeModelPreview.js";
import { resolveModelUploadMime } from "../src/infrastructure/storage/resolveModelUploadMime.js";

async function main(): Promise<void> {
  const slug = process.argv[2];
  if (!slug) {
    throw new Error("Usage: reoptimizeModel.ts <product-slug>");
  }

  const config = loadConfig();
  const { db, pool } = createDb(config.DATABASE_URL);
  const storage = new LocalFileStorage(
    config.MODEL_FILES_BASE_PATH,
    config.MODEL_FILES_BASE_URL,
    config.UPLOAD_MAX_BYTES,
  );

  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  const product = rows[0];
  if (!product?.modelFileUrl) {
    throw new Error(`Product ${slug} has no modelFileUrl`);
  }

  const sourcePath = await resolveOptimizationSourcePath(
    storage.resolvePathFromPublicUrl(product.modelFileUrl),
  );
  const mimeType = resolveModelUploadMime(
    path.basename(sourcePath),
    "application/octet-stream",
  );
  if (!mimeType) {
    throw new Error(`Unsupported model file: ${product.modelFileUrl}`);
  }

  console.log(`Optimizing ${sourcePath} (${mimeType})…`);
  const preview = await optimizeModelPreview({
    sourcePath,
    mimeType,
    modelsBasePath: config.MODEL_FILES_BASE_PATH,
  });

  if (!preview) {
    throw new Error("Optimization failed or preview still too large");
  }

  await db
    .update(products)
    .set({ modelFileUrl: preview.previewUrl, updatedAt: new Date() })
    .where(eq(products.id, product.id));

  const redis = await createRedisClient(config.REDIS_URL);
  const cache = new CacheService(redis);
  await cache.del(productCacheKey(slug, "pt-BR"));
  await cache.del(productCacheKey(slug, "en"));
  await cache.deleteByPrefix("v1:products:");
  if (typeof redis.quit === "function") {
    await redis.quit();
  }

  console.log(`Updated ${slug} → ${preview.previewUrl} (${preview.sizeBytes} bytes)`);
  await pool.end();
}

async function resolveOptimizationSourcePath(modelPath: string): Promise<string> {
  if (!modelPath.endsWith("-preview.glb")) {
    return modelPath;
  }

  const stem = modelPath.slice(0, -"-preview.glb".length);
  for (const ext of [".stl", ".glb", ".3mf", ".gltf"]) {
    const candidate = `${stem}${ext}`;
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return modelPath;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
