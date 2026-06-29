import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type { AdminAuthDto } from "../../application/dtos/AdminAuthDto.js";
import type { StoreCartItem, StoreUserProfile } from "@print3d/shared-types";

declare module "fastify" {
  interface FastifyRequest {
    locale: SupportedLocale;
    cacheMaxAge?: number;
    adminUser?: AdminAuthDto;
    storeUser?: StoreUserProfile;
    storeCart?: StoreCartItem[];
    storeCheckoutNote?: string | null;
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
    requireStoreUser: (
      request: FastifyRequest,
      reply: import("fastify").FastifyReply,
    ) => Promise<void>;
    setStoreSessionCookie: (
      reply: import("fastify").FastifyReply,
      token: string,
    ) => void;
    clearStoreSessionCookie: (reply: import("fastify").FastifyReply) => void;
  }
}

export {};
