import { seedCatalog } from "./seedCatalog.js";
import { seedAdminUser } from "./seedAdmin.js";
import { seedAssets } from "./seedAssets.js";
import { seedHeroLogo } from "./seedHeroLogo.js";
import { seedModels } from "./seedModels.js";
import { seedShopSettings } from "./seedShopSettings.js";
import { CacheService } from "../src/infrastructure/cache/CacheService.js";
import { createRedisClient } from "../src/infrastructure/cache/redis.js";

const connectionString =
  process.env.DATABASE_URL ?? process.env.TEST_DATABASE_URL ?? "";

if (connectionString.length === 0) {
  console.error("DATABASE_URL or TEST_DATABASE_URL is required.");
  process.exit(1);
}

async function flushCatalogCache(env: Record<string, string | undefined>): Promise<void> {
  const redisUrl = env.REDIS_URL;
  if (!redisUrl) {
    return;
  }
  const redis = await createRedisClient(redisUrl);
  try {
    const cache = new CacheService(redis);
    await cache.flush();
    console.log("[seed] Flushed Redis catalog cache");
  } finally {
    await redis.quit();
  }
}

await seedAssets(process.env);
await seedHeroLogo(process.env);
const modelOverrides = await seedModels(process.env);
await seedCatalog(connectionString, modelOverrides);
await flushCatalogCache(process.env);
await seedShopSettings(connectionString, process.env);
await seedAdminUser(connectionString);
console.log("Seed completed successfully (catalog, assets, models, admin).");
