import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type { AdminAuthDto } from "../../application/dtos/AdminAuthDto.js";

declare module "fastify" {
  interface FastifyRequest {
    locale: SupportedLocale;
    cacheMaxAge?: number;
    adminUser?: AdminAuthDto;
  }

  interface FastifyInstance {
    requireAdmin: (
      request: FastifyRequest,
      reply: import("fastify").FastifyReply,
    ) => Promise<void>;
    setAdminSessionCookie: (
      reply: import("fastify").FastifyReply,
      token: string,
    ) => void;
    clearAdminSessionCookie: (reply: import("fastify").FastifyReply) => void;
  }
}

export {};
