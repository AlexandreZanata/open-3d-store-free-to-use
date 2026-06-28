import { createDb } from "../src/infrastructure/db/client.js";
import { CacheService } from "../src/infrastructure/cache/CacheService.js";
import { createRedisClient, disconnectRedis } from "../src/infrastructure/cache/redis.js";
import { DrizzleProductRepository } from "../src/infrastructure/repositories/DrizzleProductRepository.js";
import { DrizzleCategoryRepository } from "../src/infrastructure/repositories/DrizzleCategoryRepository.js";
import { DrizzleOrderCaptureRepository } from "../src/infrastructure/repositories/DrizzleOrderCaptureRepository.js";
import { GetProductBySlug } from "../src/application/use-cases/GetProductBySlug.js";
import { GetCategories } from "../src/application/use-cases/GetCategories.js";
import { CaptureOrder } from "../src/application/use-cases/CaptureOrder.js";

const dbUrl = process.env.DATABASE_URL ?? "";
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

if (dbUrl.length === 0) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const { db, pool } = createDb(dbUrl);
const redis = await createRedisClient(redisUrl);
const cache = new CacheService(redis);

const getProduct = new GetProductBySlug(new DrizzleProductRepository(db), cache);
const getCategories = new GetCategories(new DrizzleCategoryRepository(db), cache);
const captureOrder = new CaptureOrder(
  new DrizzleProductRepository(db),
  new DrizzleOrderCaptureRepository(db),
  "5565999999999",
);

const en = await getProduct.execute("custom-photo-frame", "en");
const pt = await getProduct.execute("custom-photo-frame", "pt-BR");
console.log("Product EN:", en?.name, en?.basePriceDisplay);
console.log("Product PT:", pt?.name);

const categories = await getCategories.execute("en");
console.log("Categories:", categories.map((c) => c.name).join(", "));

const order = await captureOrder.execute({
  items: [
    {
      productId: en!.id,
      quantity: 1,
      selectedOptions: { Color: "White", "Name to engrave": "Test" },
    },
  ],
  customerName: "Maria",
});
console.log("Order:", order.totalPrice, order.whatsappLink.slice(0, 40) + "...");

await pool.end();
await disconnectRedis(redis);
