import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import { Redis } from "ioredis";

import type { AppConfig } from "../../config.js";

export function resolveGlobalRateLimitMax(config: AppConfig): number {
  if (config.NODE_ENV === "development") {
    return 0;
  }
  if (config.NODE_ENV === "test") {
    return 10_000;
  }
  return 100;
}

export function isGlobalRateLimitEnabled(config: AppConfig): boolean {
  return config.NODE_ENV === "production";
}

export async function registerRateLimit(
  app: FastifyInstance,
  config: AppConfig,
): Promise<void> {
  const redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5_000,
  });

  await app.register(rateLimit, {
    global: isGlobalRateLimitEnabled(config),
    max: resolveGlobalRateLimitMax(config),
    timeWindow: "1 minute",
    redis,
    nameSpace: `print3d-rate-limit-${config.PORT}-`,
  });
}
