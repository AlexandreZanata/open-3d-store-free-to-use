/**
 * Contract: docs/api/admin-contract.md — admin category CRUD
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

describe("Admin category routes (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;
  let sessionCookie = "";

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
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)("lists and creates categories", async () => {
    const list = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: "/api/v1/admin/categories",
      }),
    );
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.json().data)).toBe(true);

    const create = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "POST",
        url: "/api/v1/admin/categories",
        payload: {
          slug: "admin-test-category",
          parentId: null,
          imageUrl: null,
          sortOrder: 99,
          isActive: true,
          translations: {
            en: { name: "Admin Test", description: "Created in route test" },
            "pt-BR": { name: "Teste Admin", description: "Criado no teste de rota" },
          },
        },
      }),
    );
    expect(create.statusCode).toBe(201);
    const category = create.json().data;
    expect(category.slug).toBe("admin-test-category");

    const detail = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: `/api/v1/admin/categories/${category.id}`,
      }),
    );
    expect(detail.statusCode).toBe(200);
  });
});
