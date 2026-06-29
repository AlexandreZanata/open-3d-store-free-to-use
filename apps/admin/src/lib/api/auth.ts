import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminMeResponse,
  AdminRefreshResponse,
} from "@print3d/shared-types";

import { adminFetch, adminPost } from "./client";

export async function loginAdmin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
  return adminPost<AdminLoginResponse>("/auth/login", credentials, { skipSessionRetry: true });
}

export async function logoutAdmin(): Promise<void> {
  await adminPost<void>("/auth/logout", {}, { skipSessionRetry: true });
}

export async function fetchAdminMe(): Promise<AdminMeResponse> {
  return adminFetch<AdminMeResponse>("/auth/me");
}

export async function refreshAdminSession(): Promise<AdminRefreshResponse> {
  return adminPost<AdminRefreshResponse>("/auth/refresh", {}, { skipSessionRetry: true });
}
