/**
 * Contract: docs/api/admin-contract.md — session cookie refresh on 401.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  registerAdminSessionCoordinator,
  shouldRetryAdminSession,
} from "@/lib/api/adminSessionCoordinator";
import { adminFetch, adminRequest } from "@/lib/api/client";

describe("admin session coordinator", () => {
  it("skips session retry for auth endpoints", () => {
    expect(shouldRetryAdminSession("/auth/login")).toBe(false);
    expect(shouldRetryAdminSession("/auth/logout")).toBe(false);
    expect(shouldRetryAdminSession("/auth/refresh")).toBe(false);
    expect(shouldRetryAdminSession("/auth/me")).toBe(false);
    expect(shouldRetryAdminSession("/products")).toBe(true);
    expect(shouldRetryAdminSession("/uploads")).toBe(true);
  });
});

describe("admin API client — session recovery", () => {
  let unregister: (() => void) | undefined;

  afterEach(() => {
    unregister?.();
    unregister = undefined;
    vi.unstubAllGlobals();
  });

  it("retries protected requests after refresh succeeds on 401", async () => {
    const onSessionExpired = vi.fn();
    unregister = registerAdminSessionCoordinator({
      tryRefresh: vi.fn().mockResolvedValue(true),
      onSessionExpired,
    });

    const problem401 = {
      type: "https://yourdomain.com/errors/unauthorized",
      title: "Unauthorized",
      status: 401,
      detail: "Missing or expired session",
    };
    const okBody = { data: [{ id: "p1" }] };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => problem401,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => okBody,
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await adminFetch("/products");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(result).toEqual(okBody);
  });

  it("notifies session expiry when refresh fails after 401", async () => {
    const onSessionExpired = vi.fn();
    unregister = registerAdminSessionCoordinator({
      tryRefresh: vi.fn().mockResolvedValue(false),
      onSessionExpired,
    });

    const problem401 = {
      type: "https://yourdomain.com/errors/unauthorized",
      title: "Unauthorized",
      status: 401,
      detail: "Missing or expired session",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => problem401,
      }),
    );

    await expect(adminFetch("/products")).rejects.toMatchObject({ status: 401 });
    expect(onSessionExpired).toHaveBeenCalledOnce();
  });

  it("does not notify session expiry on unauthenticated /auth/me probe", async () => {
    const onSessionExpired = vi.fn();
    unregister = registerAdminSessionCoordinator({
      tryRefresh: vi.fn().mockResolvedValue(false),
      onSessionExpired,
    });

    const problem401 = {
      type: "https://yourdomain.com/errors/unauthorized",
      title: "Unauthorized",
      status: 401,
      detail: "Missing or expired session",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => problem401,
      }),
    );

    await expect(adminFetch("/auth/me")).rejects.toMatchObject({ status: 401 });
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("routes multipart uploads through session recovery", async () => {
    const onSessionExpired = vi.fn();
    unregister = registerAdminSessionCoordinator({
      tryRefresh: vi.fn().mockResolvedValue(true),
      onSessionExpired,
    });

    const problem401 = {
      type: "https://yourdomain.com/errors/unauthorized",
      title: "Unauthorized",
      status: 401,
      detail: "Autenticação necessária",
    };
    const okBody = { data: { url: "/models/thumbnails/x.webp" } };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => problem401,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => okBody,
      });
    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    formData.append("kind", "thumbnail");
    formData.append("file", new File(["x"], "x.png", { type: "image/png" }));

    const response = await adminRequest("/uploads", { method: "POST", body: formData });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(response.ok).toBe(true);
    await expect(response.json()).resolves.toEqual(okBody);
  });
});
