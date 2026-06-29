import { and, eq } from "drizzle-orm";

import type { IStoreUserFavoriteRepository } from "../../domain/repositories/IStoreUserRepository.js";
import type { Database } from "../db/client.js";
import { productFavorites } from "../db/schema.js";
import { storeUserFavorites } from "../db/schema.store.js";

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

  async countByUser(userId: string): Promise<number> {
    const rows = await this.db
      .select({ productId: storeUserFavorites.productId })
      .from(storeUserFavorites)
      .where(eq(storeUserFavorites.storeUserId, userId));
    return rows.length;
  }
}
