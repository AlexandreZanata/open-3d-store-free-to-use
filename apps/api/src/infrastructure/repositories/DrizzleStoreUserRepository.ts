import { and, count, eq } from "drizzle-orm";
import { parseStoreCartItems } from "./parseStoreCartItems.js";
import type { StoreCartItem } from "@print3d/shared-types";

import type {
  IStoreRegistrationRepository,
  IStoreSessionRepository,
  IStoreUserFavoriteRepository,
  IStoreUserRepository,
  IStoreUserStateRepository,
} from "../../domain/repositories/IStoreUserRepository.js";
import type {
  CreateStoreSessionInput,
  StoreSession,
  StoreUser,
} from "../../domain/entities/StoreUser.js";
import type { Database } from "../db/client.js";
import { productFavorites } from "../db/schema.js";
import {
  storeRegistrationOrigins,
  storeSessions,
  storeUserFavorites,
  storeUserState,
  storeUsers,
} from "../db/schema.store.js";

type UserRow = typeof storeUsers.$inferSelect;
type SessionRow = typeof storeSessions.$inferSelect;

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
}

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
}

export class DrizzleStoreRegistrationRepository implements IStoreRegistrationRepository {
  constructor(private readonly db: Database) {}

  async countByIp(ipAddress: string): Promise<number> {
    const result = await this.db
      .select({ value: count() })
      .from(storeRegistrationOrigins)
      .where(eq(storeRegistrationOrigins.ipAddress, ipAddress));
    return Number(result[0]?.value ?? 0);
  }

  async countByDevice(deviceId: string): Promise<number> {
    const result = await this.db
      .select({ value: count() })
      .from(storeRegistrationOrigins)
      .where(eq(storeRegistrationOrigins.deviceId, deviceId));
    return Number(result[0]?.value ?? 0);
  }

  async recordOrigin(userId: string, ipAddress: string, deviceId: string): Promise<void> {
    await this.db.insert(storeRegistrationOrigins).values({
      userId,
      ipAddress,
      deviceId,
    });
  }
}

export class DrizzleStoreUserStateRepository implements IStoreUserStateRepository {
  constructor(private readonly db: Database) {}

  async getCart(userId: string): Promise<StoreCartItem[]> {
    const rows = await this.db
      .select()
      .from(storeUserState)
      .where(eq(storeUserState.storeUserId, userId))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return [];
    }
    return parseStoreCartItems(row.cartItems);
  }

  async saveCart(userId: string, cart: StoreCartItem[]): Promise<StoreCartItem[]> {
    await this.db
      .insert(storeUserState)
      .values({ storeUserId: userId, cartItems: cart, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: storeUserState.storeUserId,
        set: { cartItems: cart, updatedAt: new Date() },
      });
    return cart;
  }
}

export class DrizzleStoreUserFavoriteRepository implements IStoreUserFavoriteRepository {
  constructor(private readonly db: Database) {}

  async listProductIds(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ productId: storeUserFavorites.productId })
      .from(storeUserFavorites)
      .where(eq(storeUserFavorites.storeUserId, userId));
    return rows.map((row) => row.productId);
  }

  async add(userId: string, productId: string): Promise<void> {
    await this.db
      .insert(storeUserFavorites)
      .values({ storeUserId: userId, productId })
      .onConflictDoNothing();
  }

  async remove(userId: string, productId: string): Promise<boolean> {
    const rows = await this.db
      .delete(storeUserFavorites)
      .where(
        and(
          eq(storeUserFavorites.storeUserId, userId),
          eq(storeUserFavorites.productId, productId),
        ),
      )
      .returning({ productId: storeUserFavorites.productId });
    return rows.length > 0;
  }

  async mergeFromVisitor(userId: string, visitorId: string): Promise<void> {
    const visitorRows = await this.db
      .select({ productId: productFavorites.productId })
      .from(productFavorites)
      .where(eq(productFavorites.visitorId, visitorId));
    if (visitorRows.length === 0) {
      return;
    }
    for (const row of visitorRows) {
      await this.add(userId, row.productId);
    }
    await this.db.delete(productFavorites).where(eq(productFavorites.visitorId, visitorId));
  }
}

function mapUserRow(row: UserRow): StoreUser {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    displayName: row.displayName,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapSessionRow(row: SessionRow): StoreSession {
  return {
    id: row.id,
    storeUserId: row.storeUserId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
  };
}
