import { describe, expect, it, afterAll } from "vitest";

import { CacheService } from "../../../src/infrastructure/cache/CacheService.js";
import {
  createRedisClient,
  disconnectRedis,
  type RedisConnection,
} from "../../../src/infrastructure/cache/redis.js";

const redisUrl = process.env.REDIS_URL ?? "";

describe("CacheService (integration)", () => {
  let redis: RedisConnection | undefined;

  afterAll(async () => {
    if (redis) {
      await disconnectRedis(redis);
    }
  });

  it.skipIf(redisUrl.length === 0)(
    "stores and retrieves values with TTL",
    async () => {
      redis = await createRedisClient(redisUrl);
      const cache = new CacheService(redis);
      const key = CacheService.product("custom-photo-frame");

      await cache.set(key, { slug: "custom-photo-frame" }, 60);
      const value = await cache.get<{ slug: string }>(key);

      expect(value?.slug).toBe("custom-photo-frame");

      await cache.del(key);
      const missing = await cache.get(key);
      expect(missing).toBeNull();
    },
  );
});
