/**
 * Contract: docs/api/swagger.md — OpenAPI spec must list every documented v1 route.
 */
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { AppContainer } from "../../../src/container.js";
import { closeTestApp, createTestApp } from "./testApp.js";

const hasDatabase = (process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "").length > 0;

/** Paths relative to server URL `/api/v1` — see registerSwagger servers config. */
const DOCUMENTED_OPENAPI_PATHS = [
  "/health",
  "/categories",
  "/products",
  "/products/{slug}",
  "/orders/capture",
  "/catalog/events",
  "/shop/config",
  "/auth/register",
  "/auth/login",
  "/auth/logout",
  "/me",
  "/me/cart",
  "/favorites",
  "/favorites/{productId}",
  "/admin/auth/login",
  "/admin/auth/logout",
  "/admin/auth/me",
  "/admin/auth/refresh",
  "/admin/products",
  "/admin/products/{id}",
  "/admin/categories",
  "/admin/categories/{id}",
  "/admin/orders",
  "/admin/orders/{id}",
  "/admin/uploads",
  "/admin/settings",
  "/admin/users",
  "/admin/users/{id}",
] as const;

describe("GET /docs/json (contract: docs/api/swagger.md)", () => {
  let app: FastifyInstance;
  let container: AppContainer;

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }
    process.env.NODE_ENV = "development";
    ({ app, container } = await createTestApp());
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)("documents all public, store, and admin v1 routes", async () => {
    const response = await app.inject({ method: "GET", url: "/docs/json" });

    expect(response.statusCode).toBe(200);
    const spec = response.json() as {
      info: { title: string; description: string };
      paths: Record<string, unknown>;
    };

    expect(spec.info.title).toBe("Corvo 3D Store API");
    expect(spec.info.description).toContain("admin-contract.md");

    const paths = Object.keys(spec.paths).sort();
    for (const path of DOCUMENTED_OPENAPI_PATHS) {
      expect(paths, `missing OpenAPI path ${path}`).toContain(path);
    }

    expect(paths.length).toBeGreaterThanOrEqual(DOCUMENTED_OPENAPI_PATHS.length);
  });
});
