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
import { seedShopSettings } from "../../../scripts/seedShopSettings.js";
import { closeTestApp, createTestApp } from "./testApp.js";
import {
  buildMultipartPayload,
  buildMultipartPayloadFileFirst,
  loginTestAdmin,
  seedTestAdmin,
  withAdminCookie,
} from "./admin/adminRouteHelpers.js";

const hasDatabase = adminTestConnectionString.length > 0;
const pngFixture = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

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
      await seedShopSettings(adminTestConnectionString);
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

  it.skipIf(!hasDatabase)("uploads thumbnail PNG and returns stored WebP contract shape", async () => {
    const multipart = buildMultipartPayload({
      kind: "thumbnail",
      filename: "test.png",
      mimeType: "image/png",
      data: pngFixture,
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
    expect(body.url).toMatch(/^\/models\/thumbnails\/.+\.webp$/);
    expect(body.kind).toBe("thumbnail");
    expect(body.mimeType).toBe("image/webp");
    expect(body.sizeBytes).toBeGreaterThan(0);
  });

  it.skipIf(!hasDatabase)("uploads when multipart sends file before kind (browser order)", async () => {
    const multipart = buildMultipartPayloadFileFirst({
      kind: "thumbnail",
      filename: "test.png",
      mimeType: "image/png",
      data: pngFixture,
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
    expect(response.json().data.kind).toBe("thumbnail");
  });

  it.skipIf(!hasDatabase)("uploads STL model with application/octet-stream MIME", async () => {
    const stl = buildMinimalBinaryStl();
    const multipart = buildMultipartPayload({
      kind: "model",
      filename: "part.stl",
      mimeType: "application/octet-stream",
      data: stl,
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
    expect(body.url).toMatch(/^\/models\/3d\/.+-preview\.glb$/);
    expect(body.sourceUrl).toMatch(/^\/models\/3d\/.+\.stl$/);
    expect(body.kind).toBe("model");
    expect(body.mimeType).toBe("model/stl");
    expect(body.sizeBytes).toBe(stl.byteLength);
    expect(body.jobId).toMatch(/^[0-9a-f-]{36}$/i);

    const jobResponse = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: `/api/v1/admin/model-jobs/${body.jobId}`,
      }),
    );
    expect(jobResponse.statusCode).toBe(200);
    expect(jobResponse.json().data.status).toBe("completed");
    expect(jobResponse.json().data.parts.length).toBeGreaterThan(0);
  });
});

function buildMinimalBinaryStl(): Buffer {
  const buffer = Buffer.alloc(134);
  buffer.writeUInt32LE(1, 80);
  buffer.writeFloatLE(0, 84 + 12);
  buffer.writeFloatLE(0, 84 + 16);
  buffer.writeFloatLE(0, 84 + 20);
  buffer.writeFloatLE(10, 84 + 24);
  buffer.writeFloatLE(0, 84 + 28);
  buffer.writeFloatLE(0, 84 + 32);
  buffer.writeFloatLE(0, 84 + 36);
  buffer.writeFloatLE(10, 84 + 40);
  buffer.writeFloatLE(0, 84 + 44);
  return buffer;
}
