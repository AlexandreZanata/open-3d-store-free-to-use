import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

import type { AppConfig } from "../../config.js";

export function isAllowedCorsOrigin(origin: string, config: AppConfig): boolean {
  if (origin === config.CORS_ORIGIN || origin === config.ADMIN_ORIGIN) {
    return true;
  }
  if (config.NODE_ENV === "development") {
    return (
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    );
  }
  return false;
}

export function buildSseCorsHeaders(
  origin: string | undefined,
  config: AppConfig,
): Record<string, string> {
  if (origin !== undefined && isAllowedCorsOrigin(origin, config)) {
    return { "Access-Control-Allow-Origin": origin, Vary: "Origin" };
  }
  if (config.NODE_ENV === "development") {
    return { "Access-Control-Allow-Origin": "*" };
  }
  return {};
}

export async function registerCors(
  app: FastifyInstance,
  config: AppConfig,
): Promise<void> {
  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || isAllowedCorsOrigin(origin, config)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });
}
