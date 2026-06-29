import { count, desc, eq, ilike, inArray } from "drizzle-orm";

import type {
  PaginatedResult,
  PaginationParams,
} from "../../domain/repositories/IProductRepository.js";
import type {
  StoreUserAdminDetailRow,
  StoreUserAdminListRow,
} from "../../domain/repositories/IStoreUserRepository.js";
import type { Database } from "../db/client.js";
import {
  storeRegistrationOrigins,
  storeUserFavorites,
  storeUserState,
  storeUsers,
} from "../db/schema.store.js";
import { parseStoreCartItems } from "./parseStoreCartItems.js";
import { buildPaginatedResult, normalizeAdminPagination } from "./pagination.js";
import { mapUserRow } from "./storeUserMappers.js";

export async function findManyStoreUsersAdmin(
  db: Database,
  pagination: PaginationParams,
  emailQuery?: string,
): Promise<PaginatedResult<StoreUserAdminListRow>> {
  const { page, limit, offset } = normalizeAdminPagination(pagination);
  const emailFilter =
    emailQuery !== undefined && emailQuery.trim().length > 0
      ? ilike(storeUsers.email, `%${emailQuery.trim()}%`)
      : undefined;

  const rows = await db
    .select({
      user: storeUsers,
      cartItems: storeUserState.cartItems,
    })
    .from(storeUsers)
    .leftJoin(storeUserState, eq(storeUserState.storeUserId, storeUsers.id))
    .where(emailFilter)
    .orderBy(desc(storeUsers.createdAt))
    .limit(limit)
    .offset(offset);

  const totalRows = await db
    .select({ value: count() })
    .from(storeUsers)
    .where(emailFilter);
  const total = Number(totalRows[0]?.value ?? 0);
  const userIds = rows.map((row) => row.user.id);
  const favoriteCounts = await loadFavoriteCounts(db, userIds);

  return buildPaginatedResult(
    rows.map((row) => ({
      user: mapUserRow(row.user),
      cartItemCount: parseStoreCartItems(row.cartItems).length,
      favoriteCount: favoriteCounts.get(row.user.id) ?? 0,
    })),
    total,
    page,
    limit,
  );
}

export async function findStoreUserAdminDetail(
  db: Database,
  userId: string,
): Promise<StoreUserAdminDetailRow | null> {
  const rows = await db
    .select({
      user: storeUsers,
      cartItems: storeUserState.cartItems,
      registrationIp: storeRegistrationOrigins.ipAddress,
      registrationDeviceId: storeRegistrationOrigins.deviceId,
    })
    .from(storeUsers)
    .leftJoin(storeUserState, eq(storeUserState.storeUserId, storeUsers.id))
    .leftJoin(storeRegistrationOrigins, eq(storeRegistrationOrigins.userId, storeUsers.id))
    .where(eq(storeUsers.id, userId))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  const favoriteCounts = await loadFavoriteCounts(db, [userId]);

  return {
    user: mapUserRow(row.user),
    cartItemCount: parseStoreCartItems(row.cartItems).length,
    favoriteCount: favoriteCounts.get(userId) ?? 0,
    registrationIp: row.registrationIp ?? null,
    registrationDeviceId: row.registrationDeviceId ?? null,
  };
}

async function loadFavoriteCounts(
  db: Database,
  userIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (userIds.length === 0) {
    return counts;
  }

  const rows = await db
    .select({
      userId: storeUserFavorites.storeUserId,
      value: count(),
    })
    .from(storeUserFavorites)
    .where(inArray(storeUserFavorites.storeUserId, userIds))
    .groupBy(storeUserFavorites.storeUserId);

  for (const row of rows) {
    counts.set(row.userId, Number(row.value));
  }
  return counts;
}
