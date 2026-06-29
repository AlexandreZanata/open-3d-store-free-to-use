import type { AdminOrderDetail, AdminOrderListResponse } from "@print3d/shared-types";

import { adminFetch } from "./client";

export type AdminOrderQuery = {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
};

function toSearchParams(params: AdminOrderQuery): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchAdminOrders(
  params: AdminOrderQuery = {},
): Promise<AdminOrderListResponse> {
  return adminFetch<AdminOrderListResponse>(`/orders${toSearchParams(params)}`);
}

export async function fetchAdminOrder(id: string): Promise<AdminOrderDetail> {
  const response = await adminFetch<{ data: AdminOrderDetail }>(`/orders/${id}`);
  return response.data;
}

export type HealthResponse = {
  status: string;
  uptime: number;
  timestamp: string;
};

export async function fetchPublicHealth(): Promise<HealthResponse> {
  const base = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
  const response = await fetch(`${base}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return (await response.json()) as HealthResponse;
}
