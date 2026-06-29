import type { ShopSettings, UpdateShopSettingsPayload } from "@print3d/shared-types";

import { adminFetch, adminPatch } from "./client";

export function fetchShopSettings(): Promise<{ data: ShopSettings }> {
  return adminFetch("/settings");
}

export function updateShopSettings(
  payload: UpdateShopSettingsPayload,
): Promise<{ data: ShopSettings }> {
  return adminPatch("/settings", payload);
}
