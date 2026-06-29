import { describe, expect, it, vi } from "vitest";

import { RefreshAdminSession } from "../../../src/application/use-cases/admin/RefreshAdminSession.js";
import type { AdminSession, AdminUser } from "../../../src/domain/entities/AdminUser.js";

const adminUser: AdminUser = {
  id: "admin-1",
  email: "admin@test.local",
  passwordHash: "hash",
  role: "admin",
  isActive: true,
  lastLoginAt: null,
  createdAt: new Date("2026-06-29T10:00:00.000Z"),
  updatedAt: new Date("2026-06-29T10:00:00.000Z"),
};

function session(expiresAt: Date): AdminSession {
  return {
    id: "session-1",
    adminUserId: adminUser.id,
    tokenHash: "hash",
    expiresAt,
    createdAt: new Date("2026-06-29T10:00:00.000Z"),
    ipAddress: null,
    userAgent: null,
  };
}

describe("RefreshAdminSession", () => {
  it("extends expiresAt within idle TTL cap", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-29T10:05:00.000Z"));

    const current = session(new Date("2026-06-29T10:10:00.000Z"));
    const touch = vi.fn().mockResolvedValue(undefined);
    const useCase = new RefreshAdminSession(
      {
        findByTokenHash: vi.fn().mockResolvedValue(current),
        touch,
        create: vi.fn(),
        delete: vi.fn(),
        deleteExpired: vi.fn(),
      },
      {
        findById: vi.fn().mockResolvedValue(adminUser),
      },
    );

    await useCase.execute({
      tokenHash: "hash",
      sessionTtlSeconds: 28_800,
      idleTtlSeconds: 1_800,
    });

    expect(touch).toHaveBeenCalledWith(
      "session-1",
      new Date("2026-06-29T10:35:00.000Z"),
    );

    vi.useRealTimers();
  });
});
