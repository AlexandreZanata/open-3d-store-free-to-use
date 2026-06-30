import { describe, expect, it } from "vitest";

import {
  sessionCookieSecure,
  sessionCookieSecureForRequest,
} from "../../../src/http/sessionCookieOptions.js";

describe("sessionCookieSecure", () => {
  it("is false for HTTP production origins (VPS IP phase)", () => {
    expect(
      sessionCookieSecure({
        NODE_ENV: "production",
        CORS_ORIGIN: "http://72.60.147.2",
        ADMIN_ORIGIN: "http://72.60.147.2/admin",
      }),
    ).toBe(false);
  });

  it("is false when only one origin is HTTPS", () => {
    expect(
      sessionCookieSecure({
        NODE_ENV: "production",
        CORS_ORIGIN: "https://shop.example.com",
        ADMIN_ORIGIN: "http://72.60.147.2/admin",
      }),
    ).toBe(false);
  });

  it("is true when both production origins are HTTPS", () => {
    expect(
      sessionCookieSecure({
        NODE_ENV: "production",
        CORS_ORIGIN: "https://shop.example.com",
        ADMIN_ORIGIN: "https://admin.example.com",
      }),
    ).toBe(true);
  });

  it("is false in development", () => {
    expect(
      sessionCookieSecure({
        NODE_ENV: "development",
        CORS_ORIGIN: "http://127.0.0.1:5173",
        ADMIN_ORIGIN: "http://127.0.0.1:5174",
      }),
    ).toBe(false);
  });
});

describe("sessionCookieSecureForRequest", () => {
  const httpsConfig = {
    NODE_ENV: "production" as const,
    CORS_ORIGIN: "https://shop.example.com",
    ADMIN_ORIGIN: "https://admin.example.com",
  };

  it("is false on HTTP requests even when env origins are HTTPS", () => {
    expect(
      sessionCookieSecureForRequest(
        { protocol: "http", headers: { "x-forwarded-proto": "http" } },
        httpsConfig,
      ),
    ).toBe(false);
  });

  it("is true on HTTPS requests when env origins are HTTPS", () => {
    expect(
      sessionCookieSecureForRequest(
        { protocol: "http", headers: { "x-forwarded-proto": "https" } },
        httpsConfig,
      ),
    ).toBe(true);
  });
});
