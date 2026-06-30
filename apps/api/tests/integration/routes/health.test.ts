import { describe, expect, it, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import { closeTestApp, createTestApp } from "./testApp.js";
import type { AppContainer } from "../../../src/container.js";
import rootPackage from "../../../../../package.json";

const hasDatabase = (process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "").length > 0;

describe("GET /api/v1/health (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }
    ({ app, container } = await createTestApp());
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)("returns status ok per contract", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/health",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("ok");
    expect(typeof body.uptime).toBe("number");
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(body.version).toBe(rootPackage.version);
  });
});
