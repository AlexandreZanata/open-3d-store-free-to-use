import { describe, expect, it, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import { seedCatalog } from "../../../scripts/seedCatalog.js";
import { testConnectionString, truncateCatalogTables, withTestDb } from "../../setup.js";
import { closeTestApp, createTestApp } from "./testApp.js";
import type { AppContainer } from "../../../src/container.js";

const hasDatabase = testConnectionString.length > 0;

describe("GET /api/v1/categories (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }
    await withTestDb(async (_db, pool) => {
      await truncateCatalogTables(pool);
      await seedCatalog(testConnectionString);
    });
    ({ app, container } = await createTestApp());
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)(
    "returns active categories with locale per contract",
    async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/categories",
        headers: { "accept-language": "en" },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.length).toBeGreaterThanOrEqual(3);
      expect(body.data[0]).toMatchObject({
        slug: expect.any(String),
        name: expect.any(String),
        sortOrder: expect.any(Number),
        imageUrl: expect.any(String),
      });
      expect(body.data[0].locale).toBe("en");
      expect(response.headers["cache-control"]).toBe("public, max-age=300");
    },
  );
});
