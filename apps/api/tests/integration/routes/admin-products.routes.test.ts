/**
 * Contract: docs/api/admin-contract.md — admin product CRUD
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
import { adminProductFixture } from "../repositories/adminFixtures.js";
import { closeTestApp, createTestApp } from "./testApp.js";
import {
  loginTestAdmin,
  seedTestAdmin,
  withAdminCookie,
} from "./admin/adminRouteHelpers.js";

const hasDatabase = adminTestConnectionString.length > 0;

describe("Admin product routes (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;
  let sessionCookie = "";
  let categoryId = "";

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

    const categories = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: "/api/v1/admin/categories",
      }),
    );
    categoryId = categories.json().data[0]?.id;
    expect(categoryId).toBeDefined();
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)("creates, reads, updates, and deletes a product", async () => {
    const create = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "POST",
        url: "/api/v1/admin/products",
        payload: {
          ...adminProductFixture,
          slug: "admin-route-frame",
          categoryId,
        },
      }),
    );
    expect(create.statusCode).toBe(201);
    const created = create.json().data;
    expect(created.slug).toBe("admin-route-frame");
    expect(created.translations.en.name).toBe("Custom Photo Frame");

    const detail = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: `/api/v1/admin/products/${created.id}`,
      }),
    );
    expect(detail.statusCode).toBe(200);
    expect(detail.json().data.id).toBe(created.id);

    const patch = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "PATCH",
        url: `/api/v1/admin/products/${created.id}`,
        payload: {
          status: "out_of_stock",
        },
      }),
    );
    expect(patch.statusCode).toBe(200);
    expect(patch.json().data.status).toBe("out_of_stock");

    const newThumbnail = "/models/thumbnails/admin-route-frame.webp";
    const patchThumbnail = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "PATCH",
        url: `/api/v1/admin/products/${created.id}`,
        payload: {
          thumbnailUrl: newThumbnail,
          imageUrls: [newThumbnail],
        },
      }),
    );
    expect(patchThumbnail.statusCode).toBe(200);
    expect(patchThumbnail.json().data.thumbnailUrl).toBe(newThumbnail);

    const detailAfterThumbnail = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: `/api/v1/admin/products/${created.id}`,
      }),
    );
    expect(detailAfterThumbnail.json().data.thumbnailUrl).toBe(newThumbnail);

    const list = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: "/api/v1/admin/products?status=out_of_stock",
      }),
    );
    expect(list.statusCode).toBe(200);
    expect(list.json().pagination).toMatchObject({
      page: 1,
      limit: 20,
    });

    const del = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "DELETE",
        url: `/api/v1/admin/products/${created.id}`,
      }),
    );
    expect(del.statusCode).toBe(204);
  });

  it.skipIf(!hasDatabase)("returns 409 on duplicate slug", async () => {
    const payload = {
      ...adminProductFixture,
      slug: "duplicate-slug-test",
      categoryId,
    };

    const first = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "POST",
        url: "/api/v1/admin/products",
        payload,
      }),
    );
    expect(first.statusCode).toBe(201);

    const second = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "POST",
        url: "/api/v1/admin/products",
        payload,
      }),
    );
    expect(second.statusCode).toBe(409);
    expect(second.json().status).toBe(409);

    const createdId = first.json().data.id as string;
    const cleanup = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "DELETE",
        url: `/api/v1/admin/products/${createdId}`,
      }),
    );
    expect(cleanup.statusCode).toBe(204);
  });
});
