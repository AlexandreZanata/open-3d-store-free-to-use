/**
 * Contract: docs/api/admin-contract.md — GET /admin/orders
 */
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import { seedCatalog } from "../../../scripts/seedCatalog.js";
import type { AppContainer } from "../../../src/container.js";
import {
  adminTestConnectionString,
  truncateAdminTables,
  truncateCatalogTables,
  withTestDb,
} from "../../setup.js";
import { closeTestApp, createTestApp } from "./testApp.js";
import {
  loginTestAdmin,
  seedTestAdmin,
  withAdminCookie,
} from "./admin/adminRouteHelpers.js";

const hasDatabase = adminTestConnectionString.length > 0;

describe("Admin order routes (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;
  let sessionCookie = "";
  let orderId = "";

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }
    await withTestDb(async (_db, pool) => {
      await truncateCatalogTables(pool);
      await truncateAdminTables(pool);
      await seedCatalog(adminTestConnectionString);
      await seedTestAdmin(adminTestConnectionString);
    }, adminTestConnectionString);
    ({ app, container } = await createTestApp());
    sessionCookie = await loginTestAdmin(app);

    const products = await app.inject({
      method: "GET",
      url: "/api/v1/products?limit=1",
      headers: { "accept-language": "en" },
    });
    const productId = products.json().data[0]?.id;

    const capture = await app.inject({
      method: "POST",
      url: "/api/v1/orders/capture",
      payload: {
        items: [
          {
            productId,
            quantity: 1,
            selectedOptions: { Color: "White", "Name to engrave": "Test" },
          },
        ],
      },
    });
    orderId = capture.json().data.orderId;
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)("lists and loads captured orders", async () => {
    const list = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: "/api/v1/admin/orders",
      }),
    );
    expect(list.statusCode).toBe(200);
    expect(list.json().pagination).toMatchObject({ page: 1, limit: 20 });
    expect(list.json().data.length).toBeGreaterThan(0);

    const detail = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: `/api/v1/admin/orders/${orderId}`,
      }),
    );
    expect(detail.statusCode).toBe(200);
    expect(detail.json().data.id).toBe(orderId);
    expect(detail.json().data.totalDisplay).toMatch(/^R\$ /);
  });
});
