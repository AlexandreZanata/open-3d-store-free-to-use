/**
 * Contract: docs/api/admin-contract.md — GET /admin/users
 */
import { randomUUID } from "node:crypto";
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

describe("Admin store user routes (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;
  let sessionCookie = "";
  let storeUserId = "";

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

    const register = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      headers: {
        "x-device-id": randomUUID(),
        "x-forwarded-for": `10.77.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
        "accept-language": "en",
      },
      payload: {
        email: `admin-users-${randomUUID().slice(0, 8)}@example.com`,
        password: "password123",
        displayName: "Contract Shopper",
      },
    });
    expect(register.statusCode).toBe(201);
    storeUserId = register.json().data.id;
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)("lists, loads, and deactivates storefront users", async () => {
    const list = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: "/api/v1/admin/users",
      }),
    );
    expect(list.statusCode).toBe(200);
    expect(list.json().pagination).toMatchObject({ page: 1, limit: 20 });
    expect(list.json().data.some((row: { id: string }) => row.id === storeUserId)).toBe(true);

    const detail = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: `/api/v1/admin/users/${storeUserId}`,
      }),
    );
    expect(detail.statusCode).toBe(200);
    expect(detail.json().data).toMatchObject({
      id: storeUserId,
      displayName: "Contract Shopper",
      isActive: true,
      cartItemCount: 0,
      favoriteCount: 0,
    });

    const deactivate = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "PATCH",
        url: `/api/v1/admin/users/${storeUserId}`,
        payload: { isActive: false },
      }),
    );
    expect(deactivate.statusCode).toBe(200);
    expect(deactivate.json().data.isActive).toBe(false);
  });
});
