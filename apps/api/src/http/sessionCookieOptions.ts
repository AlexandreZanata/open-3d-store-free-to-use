import type { FastifyRequest } from "fastify";

import type { AppConfig } from "../config.js";

/** Secure cookies require HTTPS — skip on HTTP VPS (IP-only phase). */
export function sessionCookieSecure(
  config: Pick<AppConfig, "NODE_ENV" | "CORS_ORIGIN" | "ADMIN_ORIGIN">,
): boolean {
  if (config.NODE_ENV !== "production") {
    return false;
  }
  return (
    config.CORS_ORIGIN.startsWith("https://") &&
    config.ADMIN_ORIGIN.startsWith("https://")
  );
}

/** Prefer live request scheme over env placeholders (HTTP admin on IP VPS). */
export function sessionCookieSecureForRequest(
  request: Pick<FastifyRequest, "protocol" | "headers">,
  config: Pick<AppConfig, "NODE_ENV" | "CORS_ORIGIN" | "ADMIN_ORIGIN">,
): boolean {
  if (config.NODE_ENV !== "production") {
    return false;
  }
  const forwarded = request.headers["x-forwarded-proto"];
  const proto =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : request.protocol;
  if (proto !== "https") {
    return false;
  }
  return sessionCookieSecure(config);
}

export function sessionCookieSameSite(
  config: Pick<AppConfig, "NODE_ENV">,
): "strict" | "lax" {
  return config.NODE_ENV === "production" ? "strict" : "lax";
}
