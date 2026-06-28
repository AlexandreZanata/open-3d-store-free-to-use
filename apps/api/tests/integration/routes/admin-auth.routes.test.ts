/**
 * Contract: docs/api/admin-contract.md — POST /admin/auth/*
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
  loginTestAdmin,
  seedTestAdmin,
  TEST_ADMIN_EMAIL,
  withAdminCookie,
} from "./admin/adminRouteHelpers.js";

const hasDatabase = adminTestConnectionString.length > 0;

describe("Admin auth routes (contract)", () => {
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

  it.skipIf(!hasDatabase)("returns 401 for invalid login credentials", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      payload: {
        email: TEST_ADMIN_EMAIL,
        password: "wrong-password-123",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.headers["content-type"]).toContain("application/problem+json");
  });

  it.skipIf(!hasDatabase)("returns admin profile on login per contract", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      payload: {
        email: TEST_ADMIN_EMAIL,
        password: "test-password-12",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.email).toBe(TEST_ADMIN_EMAIL);
    expect(body.data.role).toBe("admin");
    expect(String(response.headers["set-cookie"])).toContain(
      "print3d_admin_session=",
    );
  });

  it.skipIf(!hasDatabase)("returns 401 for unauthenticated /auth/me", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/admin/auth/me",
    });
    expect(response.statusCode).toBe(401);
  });

  it.skipIf(!hasDatabase)("returns profile on GET /auth/me", async () => {
    const response = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: "/api/v1/admin/auth/me",
      }),
    );
    expect(response.statusCode).toBe(200);
    expect(response.json().data.email).toBe(TEST_ADMIN_EMAIL);
  });

  it.skipIf(!hasDatabase)("returns 401 for protected admin route without session", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/admin/products",
    });
    expect(response.statusCode).toBe(401);
  });

  it.skipIf(!hasDatabase)("clears session on POST /auth/logout", async () => {
    const logout = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "POST",
        url: "/api/v1/admin/auth/logout",
      }),
    );
    expect(logout.statusCode).toBe(204);

    const me = await app.inject(
      withAdminCookie(sessionCookie, {
        method: "GET",
        url: "/api/v1/admin/auth/me",
      }),
    );
    expect(me.statusCode).toBe(401);
  });
});
