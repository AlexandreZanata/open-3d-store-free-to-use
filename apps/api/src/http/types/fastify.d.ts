import type { SupportedLocale } from "../../domain/value-objects/Locale.js";

declare module "fastify" {
  interface FastifyRequest {
    locale: SupportedLocale;
    cacheMaxAge?: number;
  }
}

export {};
