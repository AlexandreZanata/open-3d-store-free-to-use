/**
 * Contract: docs/api/admin-contract.md — RFC 7807 error shape and admin API base path.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, adminFetch, getApiBaseUrl, getFieldErrors } from "@/lib/api/client";

describe("admin API client — docs/api/admin-contract.md", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds admin URLs under /api/v1/admin", async () => {
    expect(getApiBaseUrl()).toContain("/api/v1");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: "1", email: "admin@localhost", role: "admin" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await adminFetch("/auth/me");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/admin/auth/me"),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("parses RFC 7807 problem details on 401 unauthorized", async () => {
    const problem = {
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
        json: async () => problem,
      }),
    );

    await expect(adminFetch("/auth/me")).rejects.toMatchObject({
      status: 401,
      problem,
    } satisfies Partial<ApiError>);
  });

  it("maps validation field errors from problem.errors", () => {
    const mapped = getFieldErrors({
      type: "https://yourdomain.com/errors/validation-failed",
      title: "Validation failed",
      status: 422,
      detail: "Invalid payload",
      errors: {
        email: ["Invalid email format"],
        password: ["Password too short"],
      },
    });

    expect(mapped).toEqual({
      email: "Invalid email format",
      password: "Password too short",
    });
  });
});
