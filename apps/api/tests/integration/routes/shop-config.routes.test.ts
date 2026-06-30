/**
 * Contract: docs/api/contract.md — GET /shop/config
 */
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import { seedShopSettings } from "../../../scripts/seedShopSettings.js";
import type { AppContainer } from "../../../src/container.js";
import { adminTestConnectionString, withTestDb } from "../../setup.js";
import { closeTestApp, createTestApp } from "./testApp.js";

const hasDatabase = adminTestConnectionString.length > 0;

describe("GET /shop/config (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }
    await withTestDb(async () => {
      await seedShopSettings(adminTestConnectionString);
    }, adminTestConnectionString);
    ({ app, container } = await createTestApp());
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)("returns public shop policy", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/shop/config",
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.enabledMaterials).toContain("PETG_HF");
    expect(Array.isArray(body.data.catalogMaterials)).toBe(true);
    expect(body.data.catalogMaterials.length).toBeGreaterThan(0);
    expect(body.data.paymentMethods.length).toBeGreaterThan(0);
  });
});
