import { describe, expect, it } from "vitest";

import {
  ADMIN_RATE_LIMIT,
  isGlobalRateLimitEnabled,
  resolveGlobalRateLimitMax,
} from "../../../src/http/plugins/rate-limit.js";
import type { AppConfig } from "../../../src/config.js";

function config(nodeEnv: AppConfig["NODE_ENV"]): AppConfig {
  return {
    NODE_ENV: nodeEnv,
    PORT: 3001,
    DATABASE_URL: "postgresql://localhost/db",
    REDIS_URL: "redis://localhost:6379",
    WHATSAPP_PHONE_NUMBER: "5565999999999",
    CORS_ORIGIN: "http://localhost:5173",
    MODEL_FILES_BASE_PATH: "/tmp",
    MODEL_FILES_BASE_URL: "http://localhost/models",
    ADMIN_SESSION_TTL: 28_800,
    ADMIN_SESSION_IDLE_TTL: 1_800,
    ADMIN_ORIGIN: "http://localhost:5174",
    UPLOAD_MAX_BYTES: 5_242_880,
  };
}

describe("rate limit policy", () => {
  it("disables global rate limit in development", () => {
    expect(isGlobalRateLimitEnabled(config("development"))).toBe(false);
    expect(resolveGlobalRateLimitMax(config("development"))).toBe(0);
  });

  it("enables global rate limit in production", () => {
    expect(isGlobalRateLimitEnabled(config("production"))).toBe(true);
    expect(resolveGlobalRateLimitMax(config("production"))).toBe(100);
  });

  it("documents admin bucket separate from storefront global cap", () => {
    expect(ADMIN_RATE_LIMIT.max).toBe(600);
    expect(ADMIN_RATE_LIMIT.timeWindow).toBe("1 minute");
  });
});
