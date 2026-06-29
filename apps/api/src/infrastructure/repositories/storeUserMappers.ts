import type { StoreSession, StoreUser } from "../../domain/entities/StoreUser.js";
import {
  storeSessions,
  storeUsers,
} from "../db/schema.store.js";

export type UserRow = typeof storeUsers.$inferSelect;
export type SessionRow = typeof storeSessions.$inferSelect;

export function mapUserRow(row: UserRow): StoreUser {
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

export function mapSessionRow(row: SessionRow): StoreSession {
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
