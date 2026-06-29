import type { AppConfig } from "./config.js";
import { CaptureOrder } from "./application/use-cases/CaptureOrder.js";
import { GetShopConfig } from "./application/use-cases/GetShopConfig.js";
import { GetCategories } from "./application/use-cases/GetCategories.js";
import { GetProductBySlug } from "./application/use-cases/GetProductBySlug.js";
import { ListProducts } from "./application/use-cases/ListProducts.js";
import { SearchProducts } from "./application/use-cases/SearchProducts.js";
import {
  createAdminUseCases,
  type AdminUseCases,
} from "./container/adminUseCases.js";
import { createDb, type Database } from "./infrastructure/db/client.js";
import { Argon2PasswordHasher } from "./infrastructure/auth/Argon2PasswordHasher.js";
import { CacheService } from "./infrastructure/cache/CacheService.js";
import { CatalogEventHub } from "./infrastructure/realtime/CatalogEventHub.js";
import { RedisCatalogEventPublisher } from "./infrastructure/realtime/RedisCatalogEventPublisher.js";
import {
  createRedisClient,
  disconnectRedis,
  type RedisConnection,
} from "./infrastructure/cache/redis.js";
import { DrizzleAdminSessionRepository } from "./infrastructure/repositories/DrizzleAdminSessionRepository.js";
import { DrizzleAdminUserRepository } from "./infrastructure/repositories/DrizzleAdminUserRepository.js";
import { DrizzleAuditLogRepository } from "./infrastructure/repositories/DrizzleAuditLogRepository.js";
import { DrizzleCategoryRepository } from "./infrastructure/repositories/DrizzleCategoryRepository.js";
import { DrizzleOrderCaptureRepository } from "./infrastructure/repositories/DrizzleOrderCaptureRepository.js";
import { DrizzleProductRepository } from "./infrastructure/repositories/DrizzleProductRepository.js";
import { DrizzleShopSettingsRepository } from "./infrastructure/repositories/DrizzleShopSettingsRepository.js";
import { LocalFileStorage } from "./infrastructure/storage/LocalFileStorage.js";
import type pg from "pg";

export type AppContainer = {
  config: AppConfig;
  db: Database;
  pool: pg.Pool;
  redis: RedisConnection;
  catalogEventHub: CatalogEventHub;
  getProductBySlug: GetProductBySlug;
  listProducts: ListProducts;
  searchProducts: SearchProducts;
  getCategories: GetCategories;
  captureOrder: CaptureOrder;
  getShopConfig: GetShopConfig;
  admin: AdminUseCases;
};

export async function createContainer(
  config: AppConfig,
): Promise<AppContainer> {
  const { db, pool } = createDb(config.DATABASE_URL);
  const redis = await createRedisClient(config.REDIS_URL);

  const productRepo = new DrizzleProductRepository(db);
  const shopSettingsRepo = new DrizzleShopSettingsRepository(db);
  const categoryRepo = new DrizzleCategoryRepository(db);
  const orderRepo = new DrizzleOrderCaptureRepository(db);
  const adminUserRepo = new DrizzleAdminUserRepository(db);
  const adminSessionRepo = new DrizzleAdminSessionRepository(db);
  const auditLogRepo = new DrizzleAuditLogRepository(db);
  const cache = new CacheService(redis);
  const catalogEvents = new RedisCatalogEventPublisher(redis);
  const catalogEventHub = new CatalogEventHub(redis);
  await catalogEventHub.start();
  const passwordHasher = new Argon2PasswordHasher();
  const assetStorage = new LocalFileStorage(
    config.MODEL_FILES_BASE_PATH,
    config.MODEL_FILES_BASE_URL,
    config.UPLOAD_MAX_BYTES,
  );

  const admin = createAdminUseCases({
    config,
    admins: adminUserRepo,
    sessions: adminSessionRepo,
    auditLogs: auditLogRepo,
    products: productRepo,
    categories: categoryRepo,
    orders: orderRepo,
    cache,
    catalogEvents,
    passwordHasher,
    assetStorage,
    shopSettings: shopSettingsRepo,
  });

  return {
    config,
    db,
    pool,
    redis,
    catalogEventHub,
    getProductBySlug: new GetProductBySlug(productRepo, cache),
    listProducts: new ListProducts(productRepo, cache),
    searchProducts: new SearchProducts(productRepo, cache),
    getCategories: new GetCategories(categoryRepo, cache),
    captureOrder: new CaptureOrder(
      productRepo,
      orderRepo,
      shopSettingsRepo,
      config.WHATSAPP_PHONE_NUMBER,
    ),
    getShopConfig: new GetShopConfig(shopSettingsRepo),
    admin,
  };
}

export async function destroyContainer(container: AppContainer): Promise<void> {
  await container.catalogEventHub.stop();
  await container.pool.end();
  await disconnectRedis(container.redis);
}
