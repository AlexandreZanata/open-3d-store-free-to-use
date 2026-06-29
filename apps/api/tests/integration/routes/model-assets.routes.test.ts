/**
 * Contract: docs/features/admin-panel.md — uploaded assets served at /models/*
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
import { seedAssets } from "../../../scripts/seedAssets.js";
import {
  buildMultipartPayload,
  loginTestAdmin,
  seedTestAdmin,
  withAdminCookie,
} from "./admin/adminRouteHelpers.js";

const hasDatabase = adminTestConnectionString.length > 0;
const pngFixture = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

describe("Model asset routes (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;
  let sessionCookie = "";

  beforeAll(async () => {
    ({ app, container } = await createTestApp());
    await seedAssets({
      ...process.env,
      NODE_ENV: "test",
      MODEL_FILES_BASE_PATH: container.config.MODEL_FILES_BASE_PATH,
    });
    if (!hasDatabase) {
      return;
    }
    await withTestDb(async (_db, pool) => {
      await truncateAdminTables(pool);
      await seedTestAdmin(adminTestConnectionString);
    }, adminTestConnectionString);
    sessionCookie = await loginTestAdmin(app);
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)("serves uploaded thumbnail at GET /models/thumbnails/*", async () => {
    const multipart = buildMultipartPayload({
      kind: "thumbnail",
      filename: "test.png",
      mimeType: "image/png",
      data: pngFixture,
    });

    const uploadResponse = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "POST",
        url: "/api/v1/admin/uploads",
        headers: {
          "content-type": multipart.contentType,
        },
        payload: multipart.payload,
      }),
    );

    expect(uploadResponse.statusCode).toBe(201);
    const assetPath = uploadResponse.json().data.url as string;
    expect(assetPath).toMatch(/^\/models\/thumbnails\/.+\.webp$/);

    const assetResponse = await app.inject({
      method: "GET",
      url: assetPath,
    });

    expect(assetResponse.statusCode).toBe(200);
    expect(assetResponse.headers["content-type"]).toMatch(/image\/webp/);
    expect(assetResponse.rawPayload.length).toBeGreaterThan(0);
  });

  it("serves seeded catalog thumbnail with CORS for storefront origin", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/models/thumbnails/photo-frame.webp",
      headers: { origin: "http://localhost:5176" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/image\/webp/);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5176");
    expect(response.rawPayload.length).toBeGreaterThan(100);
  });

  it.skipIf(!hasDatabase)("returns 404 for missing asset path", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/models/thumbnails/missing-file.webp",
    });

    expect(response.statusCode).toBe(404);
  });

  it("does not serve files outside the model directory", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/models/thumbnails/../../etc/passwd",
    });

    expect(response.statusCode).not.toBe(200);
    expect([403, 404]).toContain(response.statusCode);
  });
});
