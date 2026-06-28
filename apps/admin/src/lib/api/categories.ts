import type {
  AdminCategoryDetail,
  AdminCategoryListResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@print3d/shared-types";

import { adminDelete, adminFetch, adminPatch, adminPost } from "./client";

export async function fetchAdminCategories(): Promise<AdminCategoryListResponse> {
  return adminFetch<AdminCategoryListResponse>("/categories");
}

export async function fetchAdminCategory(id: string): Promise<AdminCategoryDetail> {
  const response = await adminFetch<{ data: AdminCategoryDetail }>(`/categories/${id}`);
  return response.data;
}

export async function createAdminCategory(
  payload: CreateCategoryPayload,
): Promise<AdminCategoryDetail> {
  const response = await adminPost<{ data: AdminCategoryDetail }>("/categories", payload);
  return response.data;
}

export async function updateAdminCategory(
  id: string,
  payload: UpdateCategoryPayload,
): Promise<AdminCategoryDetail> {
  const response = await adminPatch<{ data: AdminCategoryDetail }>(`/categories/${id}`, payload);
  return response.data;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await adminDelete(`/categories/${id}`);
}
