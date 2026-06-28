import { describe, expect, it, vi } from "vitest";

import { AuditLogger } from "../../../../src/application/services/AuditLogger.js";
import { LoginAdmin } from "../../../../src/application/use-cases/admin/LoginAdmin.js";
import { InvalidCredentialsError } from "../../../../src/application/errors/ApplicationErrors.js";
import {
  createMockAdminSessionRepository,
  createMockAdminUserRepository,
  createMockAuditLogRepository,
  createMockPasswordHasher,
  sampleAdminUser,
} from "./adminTestHelpers.js";

describe("LoginAdmin", () => {
  it("creates session and audits successful login", async () => {
    const admins = createMockAdminUserRepository({
      findByEmail: vi.fn(async () => sampleAdminUser),
      updateLastLogin: vi.fn(async () => undefined),
    });
    const sessions = createMockAdminSessionRepository({
      create: vi.fn(async (input) => ({
        id: "session-id",
        adminUserId: input.adminUserId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        createdAt: new Date(),
        ipAddress: null,
        userAgent: null,
      })),
    });
    const passwordHasher = createMockPasswordHasher({
      verify: vi.fn(async () => true),
    });
    const auditLogs = createMockAuditLogRepository();
    const audit = new AuditLogger(auditLogs);
    const useCase = new LoginAdmin(admins, sessions, passwordHasher, audit);

    const result = await useCase.execute({
      email: sampleAdminUser.email,
      password: "secret",
      sessionTtlSeconds: 3600,
    });

    expect(result.admin.email).toBe(sampleAdminUser.email);
    expect(result.sessionToken).toHaveLength(64);
    expect(sessions.create).toHaveBeenCalledOnce();
    expect(auditLogs.append).toHaveBeenCalledWith(
      expect.objectContaining({ action: "admin.login" }),
    );
  });

  it("throws generic invalid credentials without revealing unknown email", async () => {
    const admins = createMockAdminUserRepository({
      findByEmail: vi.fn(async () => null),
    });
    const auditLogs = createMockAuditLogRepository();
    const useCase = new LoginAdmin(
      admins,
      createMockAdminSessionRepository(),
      createMockPasswordHasher(),
      new AuditLogger(auditLogs),
    );

    await expect(
      useCase.execute({
        email: "unknown@example.com",
        password: "wrong",
        sessionTtlSeconds: 3600,
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    expect(auditLogs.append).toHaveBeenCalledWith(
      expect.objectContaining({ action: "admin.login.failure" }),
    );
  });
});
