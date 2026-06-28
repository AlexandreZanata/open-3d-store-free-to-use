import type { AppConfig } from "./config.js";
import { CaptureOrder } from "./application/use-cases/CaptureOrder.js";
import { GetCategories } from "./application/use-cases/GetCategories.js";
import { GetProductBySlug } from "./application/use-cases/GetProductBySlug.js";
import { ListProducts } from "./application/use-cases/ListProducts.js";
import { SearchProducts } from "./application/use-cases/SearchProducts.js";
import { createDb, type Database } from "./infrastructure/db/client.js";
import { CacheService } from "./infrastructure/cache/CacheService.js";
import {
  createRedisClient,
  disconnectRedis,
  type RedisConnection,
} from "./infrastructure/cache/redis.js";
import { DrizzleCategoryRepository } from "./infrastructure/repositories/DrizzleCategoryRepository.js";
import { DrizzleOrderCaptureRepository } from "./infrastructure/repositories/DrizzleOrderCaptureRepository.js";
import { DrizzleProductRepository } from "./infrastructure/repositories/DrizzleProductRepository.js";
import type pg from "pg";

export type AppContainer = {
  config: AppConfig;
  db: Database;
  pool: pg.Pool;
  redis: RedisConnection;
  getProductBySlug: GetProductBySlug;
  listProducts: ListProducts;
  searchProducts: SearchProducts;
  getCategories: GetCategories;
  captureOrder: CaptureOrder;
};

export async function createContainer(
  config: AppConfig,
): Promise<AppContainer> {
  const { db, pool } = createDb(config.DATABASE_URL);
  const redis = await createRedisClient(config.REDIS_URL);

  const productRepo = new DrizzleProductRepository(db);
  const categoryRepo = new DrizzleCategoryRepository(db);
  const orderRepo = new DrizzleOrderCaptureRepository(db);
  const cache = new CacheService(redis);

  return {
    config,
    db,
    pool,
    redis,
    getProductBySlug: new GetProductBySlug(productRepo, cache),
    listProducts: new ListProducts(productRepo, cache),
    searchProducts: new SearchProducts(productRepo, cache),
    getCategories: new GetCategories(categoryRepo, cache),
    captureOrder: new CaptureOrder(
      productRepo,
      orderRepo,
      config.WHATSAPP_PHONE_NUMBER,
    ),
  };
}

export async function destroyContainer(container: AppContainer): Promise<void> {
  await container.pool.end();
  await disconnectRedis(container.redis);
}
