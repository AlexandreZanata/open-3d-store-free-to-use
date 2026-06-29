import type { AdminDataResponse, AdminRole } from "./admin.types.js";

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminUserSummary = {
  id: string;
  email: string;
  role: AdminRole;
  lastLoginAt: string | null;
};

export type AdminLoginResponse = AdminDataResponse<AdminUserSummary>;

export type AdminMeResponse = AdminDataResponse<AdminUserSummary>;

export type AdminRefreshResponse = AdminDataResponse<AdminUserSummary>;
