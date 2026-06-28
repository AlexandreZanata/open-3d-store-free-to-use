import { describe, expect, it, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import { seedCatalog } from "../../../scripts/seedCatalog.js";
import { testConnectionString, truncateCatalogTables, withTestDb } from "../../setup.js";
import { closeTestApp, createTestApp } from "./testApp.js";
import type { AppContainer } from "../../../src/container.js";

const hasDatabase = testConnectionString.length > 0;

describe("GET /api/v1/products (contract)", () => {
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
    "returns localized product detail for valid slug",
    async () => {
      const en = await app.inject({
        method: "GET",
        url: "/api/v1/products/custom-photo-frame",
        headers: { "accept-language": "en" },
      });
      expect(en.statusCode).toBe(200);
      expect(en.json().data.name).toBe("Custom Photo Frame");
      expect(en.json().data.basePriceDisplay).toBe("R$ 45,00");
      expect(en.json().data.locale).toBe("en");
      expect(en.headers["cache-control"]).toBe("public, max-age=600");

      const pt = await app.inject({
        method: "GET",
        url: "/api/v1/products/custom-photo-frame",
        headers: { "accept-language": "pt-BR" },
      });
      expect(pt.json().data.name).toBe("Porta-retrato personalizado");
      expect(pt.json().data.locale).toBe("pt-BR");
    },
  );

  it.skipIf(!hasDatabase)(
    "returns RFC 7807 404 with localized title for unknown slug",
    async () => {
      const en = await app.inject({
        method: "GET",
        url: "/api/v1/products/non-existent",
        headers: { "accept-language": "en" },
      });
      expect(en.statusCode).toBe(404);
      expect(en.json().title).toBe("Product not found");
      expect(en.json().status).toBe(404);

      const pt = await app.inject({
        method: "GET",
        url: "/api/v1/products/non-existent",
        headers: { "accept-language": "pt-BR" },
      });
      expect(pt.json().title).toBe("Produto não encontrado");
    },
  );

  it.skipIf(!hasDatabase)("lists products with pagination shape", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/products?page=1&limit=20",
      headers: { "accept-language": "en" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination).toMatchObject({
      page: 1,
      limit: 20,
    });
    expect(response.headers["cache-control"]).toBe("public, max-age=120");
  });
});
