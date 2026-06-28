import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import { Redis } from "ioredis";

import type { AppConfig } from "../../config.js";

export async function registerRateLimit(
  app: FastifyInstance,
  config: AppConfig,
): Promise<void> {
  const redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5_000,
  });

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
    redis,
    nameSpace: "print3d-rate-limit-",
  });
}
