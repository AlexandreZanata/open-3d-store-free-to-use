/**
 * Contract: docs/api/admin-contract.md — POST /admin/uploads
 */
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../../src/container.js";
import {
  adminTestConnectionString,
  truncateAdminTables,
  withTestDb,
} from "../../setup.js";
import { closeTestApp, createTestApp } from "./testApp.js";
import {
  buildMultipartPayload,
  loginTestAdmin,
  seedTestAdmin,
  withAdminCookie,
} from "./admin/adminRouteHelpers.js";

const hasDatabase = adminTestConnectionString.length > 0;
const webpHeader = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00]);

describe("Admin upload routes (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;
  let sessionCookie = "";

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }
    await withTestDb(async (_db, pool) => {
      await truncateAdminTables(pool);
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

  it.skipIf(!hasDatabase)("returns 400 when multipart file is missing", async () => {
    const response = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "POST",
        url: "/api/v1/admin/uploads",
        payload: {},
      }),
    );
    expect(response.statusCode).toBe(400);
  });

  it.skipIf(!hasDatabase)("uploads thumbnail and returns contract shape", async () => {
    const multipart = buildMultipartPayload({
      kind: "thumbnail",
      filename: "test.webp",
      mimeType: "image/webp",
      data: webpHeader,
    });

    const response = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "POST",
        url: "/api/v1/admin/uploads",
        headers: {
          "content-type": multipart.contentType,
        },
        payload: multipart.payload,
      }),
    );

    expect(response.statusCode).toBe(201);
    const body = response.json().data;
    expect(body.url).toMatch(/^\/models\/thumbnails\//);
    expect(body.kind).toBe("thumbnail");
    expect(body.mimeType).toBe("image/webp");
    expect(body.sizeBytes).toBeGreaterThan(0);
  });
});
