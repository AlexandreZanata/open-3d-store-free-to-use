import type { IPasswordHasher } from "../../ports/IPasswordHasher.js";
import type { IAdminSessionRepository } from "../../../domain/repositories/IAdminSessionRepository.js";
import type { IAdminUserRepository } from "../../../domain/repositories/IAdminUserRepository.js";
import { InvalidCredentialsError } from "../../errors/ApplicationErrors.js";
import {
  toAdminAuthDto,
  type LoginAdminResult,
} from "../../dtos/AdminAuthDto.js";
import type { AuditLogger } from "../../services/AuditLogger.js";
import { createSessionToken } from "../../services/sessionToken.js";

export type LoginAdminInput = {
  email: string;
  password: string;
  sessionTtlSeconds: number;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
};

export class LoginAdmin {
  constructor(
    private readonly admins: IAdminUserRepository,
    private readonly sessions: IAdminSessionRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly audit: AuditLogger,
  ) {}

  async execute(input: LoginAdminInput): Promise<LoginAdminResult> {
    const admin = await this.admins.findByEmail(input.email.trim());
    const passwordOk =
      admin !== null &&
      admin.isActive &&
      (await this.passwordHasher.verify(input.password, admin.passwordHash));

    if (!passwordOk) {
      await this.audit.log({
        adminUserId: admin?.id ?? null,
        action: "admin.login.failure",
        resourceType: "session",
        resourceId: null,
        metadata: {},
      });
      throw new InvalidCredentialsError();
    }

    const { raw, hash } = createSessionToken();
    const expiresAt = new Date(Date.now() + input.sessionTtlSeconds * 1000);
    await this.sessions.create({
      adminUserId: admin.id,
      tokenHash: hash,
      expiresAt,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    const now = new Date();
    await this.admins.updateLastLogin(admin.id, now);

    await this.audit.log({
      adminUserId: admin.id,
      action: "admin.login",
      resourceType: "session",
      resourceId: null,
      metadata: {},
    });

    return {
      admin: toAdminAuthDto({ ...admin, lastLoginAt: now }),
      sessionToken: raw,
    };
  }
}
