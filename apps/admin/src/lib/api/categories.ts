import type { AdminCategoryListResponse } from "@print3d/shared-types";

import { adminFetch } from "./client";

export async function fetchAdminCategories(): Promise<AdminCategoryListResponse> {
  return adminFetch<AdminCategoryListResponse>("/categories");
}

export async function fetchAdminCategory(id: string) {
  return adminFetch<{ data: AdminCategoryListResponse["data"][number] }>(`/categories/${id}`);
}
