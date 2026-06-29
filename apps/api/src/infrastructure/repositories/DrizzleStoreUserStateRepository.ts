import { eq } from "drizzle-orm";
import type { StoreCartItem } from "@print3d/shared-types";

import type { IStoreUserStateRepository } from "../../domain/repositories/IStoreUserRepository.js";
import type { Database } from "../db/client.js";
import { storeUserState } from "../db/schema.store.js";
import { parseStoreCartItems } from "./parseStoreCartItems.js";

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
