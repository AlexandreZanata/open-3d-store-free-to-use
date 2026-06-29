import { eq } from "drizzle-orm";

import type { IStoreSessionRepository } from "../../domain/repositories/IStoreUserRepository.js";
import type {
  CreateStoreSessionInput,
  StoreSession,
} from "../../domain/entities/StoreUser.js";
import type { Database } from "../db/client.js";
import { storeSessions } from "../db/schema.store.js";
import { mapSessionRow } from "./storeUserMappers.js";

export class DrizzleStoreSessionRepository implements IStoreSessionRepository {
  constructor(private readonly db: Database) {}

  async create(input: CreateStoreSessionInput): Promise<StoreSession> {
    const rows = await this.db.insert(storeSessions).values(input).returning();
    const row = rows[0];
    if (!row) {
      throw new Error("Failed to create store session");
    }
    return mapSessionRow(row);
  }

  async findByTokenHash(tokenHash: string): Promise<StoreSession | null> {
    const rows = await this.db
      .select()
      .from(storeSessions)
      .where(eq(storeSessions.tokenHash, tokenHash))
      .limit(1);
    const row = rows[0];
    return row ? mapSessionRow(row) : null;
  }

  async touch(id: string, expiresAt: Date): Promise<void> {
    await this.db.update(storeSessions).set({ expiresAt }).where(eq(storeSessions.id, id));
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.db.delete(storeSessions).where(eq(storeSessions.tokenHash, tokenHash));
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.db.delete(storeSessions).where(eq(storeSessions.storeUserId, userId));
  }
}
