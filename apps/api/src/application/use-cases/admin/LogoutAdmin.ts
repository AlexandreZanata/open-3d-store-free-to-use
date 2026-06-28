import type { IAdminSessionRepository } from "../../../domain/repositories/IAdminSessionRepository.js";
import { UnauthorizedError } from "../../errors/ApplicationErrors.js";
import type { AuditLogger } from "../../services/AuditLogger.js";

export class LogoutAdmin {
  constructor(
    private readonly sessions: IAdminSessionRepository,
    private readonly audit: AuditLogger,
  ) {}

  async execute(tokenHash: string): Promise<void> {
    const session = await this.sessions.findByTokenHash(tokenHash);
    if (session === null || session.expiresAt <= new Date()) {
      throw new UnauthorizedError();
    }

    await this.sessions.delete(session.id);
    await this.audit.log({
      adminUserId: session.adminUserId,
      action: "admin.logout",
      resourceType: "session",
      resourceId: session.id,
      metadata: {},
    });
  }
}
