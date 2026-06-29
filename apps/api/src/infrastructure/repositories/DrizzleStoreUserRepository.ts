import { eq } from "drizzle-orm";

import type {
  IStoreUserRepository,
  StoreUserAdminDetailRow,
  StoreUserAdminFilters,
  StoreUserAdminListRow,
} from "../../domain/repositories/IStoreUserRepository.js";
import type { StoreUser } from "../../domain/entities/StoreUser.js";
import type {
  PaginatedResult,
  PaginationParams,
} from "../../domain/repositories/IProductRepository.js";
import type { Database } from "../db/client.js";
import { storeUsers } from "../db/schema.store.js";
import {
  findManyStoreUsersAdmin,
  findStoreUserAdminDetail,
} from "./storeUserAdminPersistence.js";
import { mapUserRow } from "./storeUserMappers.js";

export class DrizzleStoreUserRepository implements IStoreUserRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<StoreUser | null> {
    const rows = await this.db
      .select()
      .from(storeUsers)
      .where(eq(storeUsers.email, email.trim().toLowerCase()))
      .limit(1);
    const row = rows[0];
    return row ? mapUserRow(row) : null;
  }

  async findById(id: string): Promise<StoreUser | null> {
    const rows = await this.db.select().from(storeUsers).where(eq(storeUsers.id, id)).limit(1);
    const row = rows[0];
    return row ? mapUserRow(row) : null;
  }

  async create(input: {
    email: string;
    passwordHash: string;
    displayName: string;
  }): Promise<StoreUser> {
    const rows = await this.db
      .insert(storeUsers)
      .values({
        email: input.email.trim().toLowerCase(),
        passwordHash: input.passwordHash,
        displayName: input.displayName.trim(),
      })
      .returning();
    const row = rows[0];
    if (!row) {
      throw new Error("Failed to create store user");
    }
    return mapUserRow(row);
  }

  async updateProfile(id: string, displayName: string): Promise<StoreUser> {
    const rows = await this.db
      .update(storeUsers)
      .set({ displayName: displayName.trim(), updatedAt: new Date() })
      .where(eq(storeUsers.id, id))
      .returning();
    const row = rows[0];
    if (!row) {
      throw new Error("Store user not found");
    }
    return mapUserRow(row);
  }

  async setActive(id: string, isActive: boolean): Promise<StoreUser> {
    const rows = await this.db
      .update(storeUsers)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(storeUsers.id, id))
      .returning();
    const row = rows[0];
    if (!row) {
      throw new Error("Store user not found");
    }
    return mapUserRow(row);
  }

  findManyAdmin(
    filters: StoreUserAdminFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<StoreUserAdminListRow>> {
    return findManyStoreUsersAdmin(this.db, pagination, filters.emailQuery);
  }

  findAdminDetail(userId: string): Promise<StoreUserAdminDetailRow | null> {
    return findStoreUserAdminDetail(this.db, userId);
  }
}
