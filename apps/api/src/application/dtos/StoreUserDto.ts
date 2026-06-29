import type { StoreCartItem, StoreUserProfile } from "@print3d/shared-types";

import type { StoreUser } from "../../domain/entities/StoreUser.js";

export function toStoreUserProfile(user: StoreUser): StoreUserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}

export function mergeStoreCarts(
  serverCart: StoreCartItem[],
  localCart: StoreCartItem[],
): StoreCartItem[] {
  const merged = new Map<string, StoreCartItem>();
  for (const item of serverCart) {
    merged.set(item.productId, { ...item });
  }
  for (const item of localCart) {
    const existing = merged.get(item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.set(item.productId, { ...item });
    }
  }
  return [...merged.values()];
}
