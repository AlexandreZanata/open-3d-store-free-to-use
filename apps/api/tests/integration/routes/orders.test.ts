import { describe, expect, it, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import { seedCatalog } from "../../../scripts/seedCatalog.js";
import { testConnectionString, truncateCatalogTables, withTestDb } from "../../setup.js";
import { closeTestApp, createTestApp } from "./testApp.js";
import type { AppContainer } from "../../../src/container.js";

const hasDatabase = testConnectionString.length > 0;

describe("POST /api/v1/orders/capture (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;
  let productId = "";

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }
    await withTestDb(async (_db, pool) => {
      await truncateCatalogTables(pool);
      await seedCatalog(testConnectionString);
    });
    ({ app, container } = await createTestApp());

    const catalog = await app.inject({
      method: "GET",
      url: "/api/v1/products/custom-photo-frame",
      headers: { "accept-language": "en" },
    });
    productId = catalog.json().data.id;
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)(
    "returns 201 with whatsappLink per contract",
    async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/orders/capture",
        headers: { "content-type": "application/json" },
        payload: {
          items: [{ productId, quantity: 1, selectedOptions: {} }],
          customerName: "Maria",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json().data;
      expect(body.whatsappLink).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
      expect(body.totalPrice).toBe("R$ 45,00");
      expect(body.orderId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    },
  );
});

describe("POST /api/v1/orders/capture rate limit (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;
  let productId = "";

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }
    await withTestDb(async (_db, pool) => {
      await truncateCatalogTables(pool);
      await seedCatalog(testConnectionString);
    });
    ({ app, container } = await createTestApp());

    const catalog = await app.inject({
      method: "GET",
      url: "/api/v1/products/custom-photo-frame",
      headers: { "accept-language": "en" },
    });
    productId = catalog.json().data.id;
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)("returns 429 when rate limit exceeded", async () => {
    const payload = {
      items: [{ productId, quantity: 1, selectedOptions: {} }],
    };

    let lastStatus = 0;
    for (let i = 0; i < 11; i += 1) {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/orders/capture",
        headers: { "content-type": "application/json" },
        payload,
      });
      lastStatus = response.statusCode;
    }

    expect(lastStatus).toBe(429);
  });
});
