import type { IAdminSessionRepository } from "../../../domain/repositories/IAdminSessionRepository.js";
import type { IAdminUserRepository } from "../../../domain/repositories/IAdminUserRepository.js";
import { UnauthorizedError } from "../../errors/ApplicationErrors.js";
import { toAdminAuthDto, type AdminAuthDto } from "../../dtos/AdminAuthDto.js";

export type RefreshAdminSessionInput = {
  tokenHash: string;
  sessionTtlSeconds: number;
  idleTtlSeconds: number;
};

export class RefreshAdminSession {
  constructor(
    private readonly sessions: IAdminSessionRepository,
    private readonly admins: IAdminUserRepository,
  ) {}

  async execute(input: RefreshAdminSessionInput): Promise<AdminAuthDto> {
    const session = await this.sessions.findByTokenHash(input.tokenHash);
    if (session === null) {
      throw new UnauthorizedError();
    }

    const now = Date.now();
    const absoluteMaxMs = session.createdAt.getTime() + input.sessionTtlSeconds * 1000;
    const slidingMs = now + input.idleTtlSeconds * 1000;
    const newExpiresAt = new Date(Math.min(slidingMs, absoluteMaxMs));

    if (newExpiresAt.getTime() <= now) {
      throw new UnauthorizedError();
    }

    if (newExpiresAt.getTime() > session.expiresAt.getTime()) {
      await this.sessions.touch(session.id, newExpiresAt);
    }

    const admin = await this.admins.findById(session.adminUserId);
    if (admin === null || !admin.isActive) {
      throw new UnauthorizedError();
    }

    return toAdminAuthDto(admin);
  }
}
