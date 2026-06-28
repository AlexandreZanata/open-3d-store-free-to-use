import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

import type { AppConfig } from "../../config.js";

export async function registerCors(
  app: FastifyInstance,
  config: AppConfig,
): Promise<void> {
  await app.register(cors, {
    origin:
      config.NODE_ENV === "development"
        ? (origin, callback) => {
            if (
              !origin ||
              origin === config.CORS_ORIGIN ||
              /^http:\/\/localhost:\d+$/.test(origin) ||
              /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
            ) {
              callback(null, true);
              return;
            }
            callback(null, false);
          }
        : config.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  });
}
