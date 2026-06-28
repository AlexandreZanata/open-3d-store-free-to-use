import { eq } from "drizzle-orm";

import type { AdminUser } from "../../domain/entities/AdminUser.js";
import type { IAdminUserRepository } from "../../domain/repositories/IAdminUserRepository.js";
import type { Database } from "../db/client.js";
import { adminUsers } from "../db/schema.js";

export class DrizzleAdminUserRepository implements IAdminUserRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<AdminUser | null> {
    const rows = await this.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase()))
      .limit(1);
    const row = rows[0];
    return row ? mapAdminUserRow(row) : null;
  }

  async findById(id: string): Promise<AdminUser | null> {
    const rows = await this.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);
    const row = rows[0];
    return row ? mapAdminUserRow(row) : null;
  }

  async updateLastLogin(id: string, at: Date): Promise<void> {
    await this.db
      .update(adminUsers)
      .set({ lastLoginAt: at, updatedAt: new Date() })
      .where(eq(adminUsers.id, id));
  }

  async create(input: {
    email: string;
    passwordHash: string;
  }): Promise<AdminUser> {
    const rows = await this.db
      .insert(adminUsers)
      .values({
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
      })
      .returning();
    const row = rows[0];
    if (!row) {
      throw new Error("Failed to create admin user");
    }
    return mapAdminUserRow(row);
  }
}

type AdminUserRow = typeof adminUsers.$inferSelect;

function mapAdminUserRow(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role,
    isActive: row.isActive,
    lastLoginAt: row.lastLoginAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
