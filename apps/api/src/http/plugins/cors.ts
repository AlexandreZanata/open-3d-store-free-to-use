import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

import type { AppConfig } from "../../config.js";

function isAllowedOrigin(origin: string, config: AppConfig): boolean {
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

export async function registerCors(
  app: FastifyInstance,
  config: AppConfig,
): Promise<void> {
  await app.register(cors, {
    origin:
      config.NODE_ENV === "development"
        ? (origin, callback) => {
            if (!origin || isAllowedOrigin(origin, config)) {
              callback(null, true);
              return;
            }
            callback(null, false);
          }
        : [config.CORS_ORIGIN, config.ADMIN_ORIGIN],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });
}
