/**
 * Contract: docs/features/catalog-realtime.md — GET /catalog/events SSE
 */
import http from "node:http";
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../../src/container.js";
import { closeTestApp, createTestApp } from "./testApp.js";
import {
  loginTestAdmin,
  seedTestAdmin,
  withAdminCookie,
} from "./admin/adminRouteHelpers.js";
import { adminTestConnectionString, truncateAdminTables, withTestDb } from "../../setup.js";
import { adminProductFixture } from "../repositories/adminFixtures.js";
import { seedCatalog } from "../../../scripts/seedCatalog.js";
import { truncateCatalogTables } from "../../setup.js";

const hasDatabase = adminTestConnectionString.length > 0;

function readSseUntil(
  port: number,
  predicate: (chunk: string) => boolean,
  timeoutMs = 8_000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    const request = http.get(
      { host: "127.0.0.1", port, path: "/api/v1/catalog/events" },
      (response) => {
        response.on("data", (buffer) => {
          const text = buffer.toString();
          chunks.push(text);
          if (predicate(chunks.join(""))) {
            cleanup();
            resolve(chunks.join(""));
          }
        });
      },
    );

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for SSE event. Received:\n${chunks.join("")}`));
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timer);
      request.destroy();
    };

    request.on("error", (error) => {
      cleanup();
      reject(error);
    });
  });
}

describe("GET /catalog/events (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;
  let port = 0;
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
    await app.listen({ host: "127.0.0.1", port: 0 });
    const address = app.server.address();
    port = typeof address === "object" && address !== null ? address.port : 0;
    expect(port).toBeGreaterThan(0);

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

  it.skipIf(!hasDatabase)("streams catalog.changed after admin product update", async () => {
    const create = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "POST",
        url: "/api/v1/admin/products",
        payload: {
          ...adminProductFixture,
          slug: "sse-live-frame",
          categoryId,
        },
      }),
    );
    expect(create.statusCode).toBe(201);
    const productId = create.json().data.id as string;

    const ssePromise = readSseUntil(port, (chunk) => chunk.includes("catalog.changed"));

    const update = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "PATCH",
        url: `/api/v1/admin/products/${productId}`,
        payload: {
          translations: {
            en: {
              name: "SSE Live Frame EN",
              shortDescription: "Short EN",
              description: "Description EN for SSE contract test",
            },
            "pt-BR": {
              name: "Moldura SSE AO VIVO",
              shortDescription: "Curta PT",
              description: "Descrição PT para teste SSE em tempo real",
            },
          },
        },
      }),
    );
    expect(update.statusCode).toBe(200);

    const payload = await ssePromise;
    expect(payload).toContain("event: catalog.changed");
    expect(payload).toContain('"resource":"product"');
    expect(payload).toContain('"action":"updated"');
    expect(payload).toContain('"slug":"sse-live-frame"');
  });
});
