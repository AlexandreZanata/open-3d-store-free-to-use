/**
 * Contract: docs/features/store-user-accounts.md — storefront auth and /me
 */
import { randomUUID } from "node:crypto";
import { describe, expect, it, afterAll, beforeAll } from "vitest";
import type { FastifyInstance } from "fastify";

import { seedCatalog } from "../../../scripts/seedCatalog.js";
import { testConnectionString, truncateCatalogTables, withTestDb } from "../../setup.js";
import { closeTestApp, createTestApp } from "./testApp.js";
import type { AppContainer } from "../../../src/container.js";

const hasDatabase = testConnectionString.length > 0;
const visitorId = randomUUID();

describe("Store user auth (contract)", () => {
  let app: FastifyInstance;
  let container: AppContainer;

  beforeAll(async () => {
    if (!hasDatabase) {
      return;
    }
    await withTestDb(async (_db, pool) => {
      await truncateCatalogTables(pool);
      await seedCatalog(testConnectionString);
    });
    ({ app, container } = await createTestApp());
  });

  afterAll(async () => {
    if (app) {
      await closeTestApp(app, container);
    }
  });

  it.skipIf(!hasDatabase)("registers, returns me, persists cart, and logs out", async () => {
    const email = `buyer-${randomUUID().slice(0, 8)}@example.com`;
    const register = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      headers: {
        "x-device-id": randomUUID(),
        "x-forwarded-for": `10.99.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
        "x-visitor-id": visitorId,
        "accept-language": "en",
      },
      payload: {
        email,
        password: "password123",
        displayName: "Maria",
        cart: [
          {
            productId: (
              await app.inject({
                method: "GET",
                url: "/api/v1/products?page=1&limit=1",
                headers: { "accept-language": "en" },
              })
            ).json().data[0].id,
            slug: "custom-photo-frame",
            name: "Custom Photo Frame",
            thumbnailUrl: "/models/thumbnails/photo-frame.webp",
            basePriceDisplay: "R$ 45,00",
            quantity: 2,
            selectedOptions: {},
          },
        ],
      },
    });
    expect(register.statusCode).toBe(201);
    const cookie = register.cookies.find((item) => item.name === "print3d_store_session");
    expect(cookie?.value).toBeTruthy();
    expect(register.json().data.email).toBe(email);
    expect(register.json().data.cart).toHaveLength(1);

    const me = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: { cookie: `print3d_store_session=${cookie!.value}` },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().data.displayName).toBe("Maria");
    expect(me.json().data.cart[0].quantity).toBe(2);

    const logout = await app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      headers: { cookie: `print3d_store_session=${cookie!.value}` },
    });
    expect(logout.statusCode).toBe(204);
  });

  it.skipIf(!hasDatabase)("enforces max 2 registrations per IP and device", async () => {
    const ip = `10.0.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`;
    const localDevice = randomUUID();

    for (let index = 0; index < 2; index += 1) {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        headers: {
          "x-device-id": localDevice,
          "x-forwarded-for": ip,
        },
        payload: {
          email: `limit-${randomUUID().slice(0, 8)}@example.com`,
          password: "password123",
          displayName: `User ${index + 1}`,
        },
      });
      expect(response.statusCode).toBe(201);
    }

    const blocked = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      headers: {
        "x-device-id": localDevice,
        "x-forwarded-for": ip,
      },
      payload: {
        email: `limit-blocked-${randomUUID().slice(0, 8)}@example.com`,
        password: "password123",
        displayName: "Blocked",
      },
    });
    expect(blocked.statusCode).toBe(403);
    expect(blocked.json().status).toBe(403);
  });
});
