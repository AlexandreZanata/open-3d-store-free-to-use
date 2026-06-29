/**
 * Contract: docs/api/admin-contract.md — storefront users admin
 */
import { describe, expect, it } from "vitest";

import type { AdminStoreUserDetailResponse, AdminStoreUserListResponse } from "../src/index.js";

describe("GET /admin/users — docs/api/admin-contract.md", () => {
  it("matches documented list response shape", () => {
    const response = {
      data: [
        {
          id: "01935abc-def0-7890-abcd-ef1234567890",
          email: "buyer@example.com",
          displayName: "Maria",
          isActive: true,
          createdAt: "2026-06-29T12:00:00.000Z",
          cartItemCount: 2,
          favoriteCount: 3,
        },
      ],
      pagination: { total: 1, page: 1, totalPages: 1, limit: 20 },
    } satisfies AdminStoreUserListResponse;

    expect(response.data[0]?.cartItemCount).toBe(2);
  });

  it("matches documented detail response shape", () => {
    const response = {
      data: {
        id: "01935abc-def0-7890-abcd-ef1234567890",
        email: "buyer@example.com",
        displayName: "Maria",
        isActive: true,
        createdAt: "2026-06-29T12:00:00.000Z",
        updatedAt: "2026-06-29T13:00:00.000Z",
        cartItemCount: 2,
        favoriteCount: 3,
        registrationIp: "10.0.0.1",
        registrationDeviceId: "01935def-7890-abcd-ef12-345678901234",
      },
    } satisfies AdminStoreUserDetailResponse;

    expect(response.data.registrationIp).toBe("10.0.0.1");
  });
});
