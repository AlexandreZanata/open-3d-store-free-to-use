import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminMeResponse,
} from "@print3d/shared-types";

import { adminFetch, adminPost } from "./client";

export async function loginAdmin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
  return adminPost<AdminLoginResponse>("/auth/login", credentials);
}

export async function logoutAdmin(): Promise<void> {
  await adminPost<void>("/auth/logout", {});
}

export async function fetchAdminMe(): Promise<AdminMeResponse> {
  return adminFetch<AdminMeResponse>("/auth/me");
}
