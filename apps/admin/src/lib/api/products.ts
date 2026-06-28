import type {
  AdminProductDetail,
  AdminProductListResponse,
  CreateProductPayload,
  PrintStatus,
  UpdateProductPayload,
} from "@print3d/shared-types";

import { adminDelete, adminFetch, adminPatch, adminPost } from "./client";

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

export async function fetchAdminProduct(id: string): Promise<AdminProductDetail> {
  const response = await adminFetch<{ data: AdminProductDetail }>(`/products/${id}`);
  return response.data;
}

export async function createAdminProduct(payload: CreateProductPayload): Promise<AdminProductDetail> {
  const response = await adminPost<{ data: AdminProductDetail }>("/products", payload);
  return response.data;
}

export async function updateAdminProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<AdminProductDetail> {
  const response = await adminPatch<{ data: AdminProductDetail }>(`/products/${id}`, payload);
  return response.data;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await adminDelete(`/products/${id}`);
}
