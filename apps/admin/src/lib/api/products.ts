import type { AdminProductListResponse, PrintStatus } from "@print3d/shared-types";

import { adminFetch } from "./client";

export type AdminProductQuery = {
  page?: number;
  limit?: number;
  status?: PrintStatus;
  category?: string;
  q?: string;
};

function toSearchParams(params: AdminProductQuery): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchAdminProducts(
  params: AdminProductQuery = {},
): Promise<AdminProductListResponse> {
  return adminFetch<AdminProductListResponse>(`/products${toSearchParams(params)}`);
}

export async function fetchAdminProduct(id: string) {
  return adminFetch<{ data: AdminProductListResponse["data"][number] }>(`/products/${id}`);
}
