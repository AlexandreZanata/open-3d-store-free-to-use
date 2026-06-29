/**
 * Contract: docs/api/contract.md — GET/POST/DELETE /favorites
 */
import { randomUUID } from "node:crypto";
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import { seedCatalog } from "../../../scripts/seedCatalog.js";
import { testConnectionString, truncateCatalogTables, withTestDb } from "../../setup.js";
import { closeTestApp, createTestApp } from "./testApp.js";
import type { AppContainer } from "../../../src/container.js";

const hasDatabase = testConnectionString.length > 0;

describe("Favorites routes (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;
  let productId: string;

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }
    await withTestDb(async (_db, pool) => {
      await truncateCatalogTables(pool);
      await seedCatalog(testConnectionString);
    });
    ({ app, container } = await createTestApp());

    const list = await app.inject({
      method: "GET",
      url: "/api/v1/products?page=1&limit=1",
      headers: { "accept-language": "en" },
    });
    productId = list.json().data[0].id as string;
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)("returns 400 when X-Visitor-Id is missing", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/favorites",
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().status).toBe(400);
  });

  it.skipIf(!hasDatabase)("adds, lists, and removes favorites for a visitor", async () => {
    const visitorId = randomUUID();

    const empty = await app.inject({
      method: "GET",
      url: "/api/v1/favorites",
      headers: { "x-visitor-id": visitorId, "accept-language": "en" },
    });
    expect(empty.statusCode).toBe(200);
    expect(empty.json()).toEqual({ data: [], meta: { count: 0, productIds: [] } });

    const added = await app.inject({
      method: "POST",
      url: `/api/v1/favorites/${productId}`,
      headers: { "x-visitor-id": visitorId, "accept-language": "en" },
      payload: {},
    });
    expect(added.statusCode).toBe(201);
    expect(added.json().data).toEqual({ productId, favorited: true });

    const listed = await app.inject({
      method: "GET",
      url: "/api/v1/favorites",
      headers: { "x-visitor-id": visitorId, "accept-language": "en" },
    });
    expect(listed.statusCode).toBe(200);
    expect(listed.json().meta.count).toBe(1);
    expect(listed.json().meta.productIds).toEqual([productId]);
    expect(listed.json().data[0].id).toBe(productId);
    expect(listed.json().data[0].slug).toBeTruthy();

    const removed = await app.inject({
      method: "DELETE",
      url: `/api/v1/favorites/${productId}`,
      headers: { "x-visitor-id": visitorId },
    });
    expect(removed.statusCode).toBe(200);
    expect(removed.json().data).toEqual({ productId, favorited: false });

    const afterRemove = await app.inject({
      method: "GET",
      url: "/api/v1/favorites",
      headers: { "x-visitor-id": visitorId, "accept-language": "en" },
    });
    expect(afterRemove.json()).toEqual({ data: [], meta: { count: 0, productIds: [] } });
  });

  it.skipIf(!hasDatabase)("returns 404 when favoriting unknown product", async () => {
    const visitorId = randomUUID();
    const missingId = randomUUID();

    const response = await app.inject({
      method: "POST",
      url: `/api/v1/favorites/${missingId}`,
      headers: { "x-visitor-id": visitorId, "accept-language": "en" },
      payload: {},
    });
    expect(response.statusCode).toBe(404);
    expect(response.json().status).toBe(404);
  });
});
