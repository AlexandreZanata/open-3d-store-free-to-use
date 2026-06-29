import { and, desc, eq } from "drizzle-orm";

import type { IProductFavoriteRepository } from "../../domain/repositories/IProductFavoriteRepository.js";
import type { Database } from "../db/client.js";
import { productFavorites } from "../db/schema.js";

export class DrizzleProductFavoriteRepository implements IProductFavoriteRepository {
  constructor(private readonly db: Database) {}

  async listProductIds(visitorId: string): Promise<string[]> {
    const rows = await this.db
      .select({ productId: productFavorites.productId })
      .from(productFavorites)
      .where(eq(productFavorites.visitorId, visitorId))
      .orderBy(desc(productFavorites.createdAt));
    return rows.map((row) => row.productId);
  }

  async add(visitorId: string, productId: string): Promise<void> {
    await this.db
      .insert(productFavorites)
      .values({ visitorId, productId })
      .onConflictDoNothing();
  }

  async remove(visitorId: string, productId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(productFavorites)
      .where(
        and(
          eq(productFavorites.visitorId, visitorId),
          eq(productFavorites.productId, productId),
        ),
      )
      .returning({ productId: productFavorites.productId });
    return deleted.length > 0;
  }
}
