import type { ShopConfig, ShopConfigResponse } from "@print3d/shared-types";

import { apiFetch } from "./client";

export async function fetchShopConfig(): Promise<ShopConfig> {
  const response = await apiFetch<ShopConfigResponse>("/shop/config");
  return response.data;
}
