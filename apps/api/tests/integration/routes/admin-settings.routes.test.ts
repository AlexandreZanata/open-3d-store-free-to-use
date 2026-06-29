/**
 * Contract: docs/api/admin-contract.md — GET/PATCH /admin/settings
 */
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import {
  DEFAULT_CALCULATOR_SETTINGS,
  DEFAULT_MATERIAL_PRICING,
} from "../../../src/domain/services/pricingCalculator.js";
import { seedShopSettings } from "../../../scripts/seedShopSettings.js";
import type { AppContainer } from "../../../src/container.js";
import {
  adminTestConnectionString,
  truncateAdminTables,
  withTestDb,
} from "../../setup.js";
import { closeTestApp, createTestApp } from "./testApp.js";
import {
  loginTestAdmin,
  seedTestAdmin,
  withAdminCookie,
} from "./admin/adminRouteHelpers.js";

const hasDatabase = adminTestConnectionString.length > 0;

describe("Admin settings routes (contract)", () => {
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

  it.skipIf(!hasDatabase)("returns and updates shop settings", async () => {
    const get = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: "/api/v1/admin/settings",
      }),
    );
    expect(get.statusCode).toBe(200);
    expect(get.json().data.enabledMaterials).toContain("PETG_HF");
    expect(get.json().data.paymentMethods).toContain("pix");

    const patch = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "PATCH",
        url: "/api/v1/admin/settings",
        payload: {
          whatsappPhone: "5565999887766",
          enabledMaterials: ["PLA", "PETG_HF"],
          availableColors: [],
          materialPricing: DEFAULT_MATERIAL_PRICING,
          calculator: DEFAULT_CALCULATOR_SETTINGS,
          offersDelivery: true,
          pickupOnly: false,
          pickupLocation: "Studio pickup",
          paymentMethods: ["pix", "cash"],
          requiresDeposit: false,
          depositPercent: null,
        },
      }),
    );
    expect(patch.statusCode).toBe(200);
    expect(patch.json().data.whatsappPhone).toBe("5565999887766");
    expect(patch.json().data.offersDelivery).toBe(true);
  });
});
