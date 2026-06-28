import type { IAdminSessionRepository } from "../../../domain/repositories/IAdminSessionRepository.js";
import type { IAdminUserRepository } from "../../../domain/repositories/IAdminUserRepository.js";
import { UnauthorizedError } from "../../errors/ApplicationErrors.js";
import { toAdminAuthDto, type AdminAuthDto } from "../../dtos/AdminAuthDto.js";

export class GetCurrentAdmin {
  constructor(
    private readonly sessions: IAdminSessionRepository,
    private readonly admins: IAdminUserRepository,
  ) {}

  async execute(tokenHash: string): Promise<AdminAuthDto> {
    const session = await this.sessions.findByTokenHash(tokenHash);
    if (session === null || session.expiresAt <= new Date()) {
      throw new UnauthorizedError();
    }

    const admin = await this.admins.findById(session.adminUserId);
    if (admin === null || !admin.isActive) {
      throw new UnauthorizedError();
    }

    return toAdminAuthDto(admin);
  }
}
