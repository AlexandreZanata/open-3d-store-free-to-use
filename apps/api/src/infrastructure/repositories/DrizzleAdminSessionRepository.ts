import { eq, lt } from "drizzle-orm";

import type {
  AdminSession,
  CreateAdminSessionInput,
} from "../../domain/entities/AdminUser.js";
import type { IAdminSessionRepository } from "../../domain/repositories/IAdminSessionRepository.js";
import type { Database } from "../db/client.js";
import { adminSessions } from "../db/schema.js";

export class DrizzleAdminSessionRepository implements IAdminSessionRepository {
  constructor(private readonly db: Database) {}

  async create(input: CreateAdminSessionInput): Promise<AdminSession> {
    const rows = await this.db
      .insert(adminSessions)
      .values({
        adminUserId: input.adminUserId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      })
      .returning();
    const row = rows[0];
    if (!row) {
      throw new Error("Failed to create admin session");
    }
    return mapAdminSessionRow(row);
  }

  async findByTokenHash(tokenHash: string): Promise<AdminSession | null> {
    const rows = await this.db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.tokenHash, tokenHash))
      .limit(1);

    const row = rows[0];
    if (!row || row.expiresAt <= new Date()) {
      return null;
    }
    return mapAdminSessionRow(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(adminSessions).where(eq(adminSessions.id, id));
  }

  async deleteExpired(before: Date): Promise<number> {
    const deleted = await this.db
      .delete(adminSessions)
      .where(lt(adminSessions.expiresAt, before))
      .returning({ id: adminSessions.id });
    return deleted.length;
  }
}

type AdminSessionRow = typeof adminSessions.$inferSelect;

function mapAdminSessionRow(row: AdminSessionRow): AdminSession {
  return {
    id: row.id,
    adminUserId: row.adminUserId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
  };
}
