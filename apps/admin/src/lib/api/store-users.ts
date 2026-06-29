import type {
  AdminStoreUserDetail,
  AdminStoreUserListResponse,
  UpdateStoreUserAdminPayload,
} from "@print3d/shared-types";

import { adminFetch, adminPatch } from "./client";

export type AdminStoreUserQuery = {
  page?: number;
  limit?: number;
  q?: string;
};

function toSearchParams(params: AdminStoreUserQuery): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.q) search.set("q", params.q);
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchAdminStoreUsers(
  params: AdminStoreUserQuery = {},
): Promise<AdminStoreUserListResponse> {
  return adminFetch<AdminStoreUserListResponse>(`/users${toSearchParams(params)}`);
}

export async function fetchAdminStoreUser(id: string): Promise<AdminStoreUserDetail> {
  const response = await adminFetch<{ data: AdminStoreUserDetail }>(`/users/${id}`);
  return response.data;
}

export async function updateAdminStoreUser(
  id: string,
  payload: UpdateStoreUserAdminPayload,
): Promise<AdminStoreUserDetail> {
  const response = await adminPatch<{ data: AdminStoreUserDetail }>(`/users/${id}`, payload);
  return response.data;
}
