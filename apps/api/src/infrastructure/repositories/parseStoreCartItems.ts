import type { StoreCartItem } from "@print3d/shared-types";

export function parseStoreCartItems(
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- JSONB column from drizzle
  raw: unknown,
): StoreCartItem[] {
  return Array.isArray(raw) ? (raw as StoreCartItem[]) : [];
}
