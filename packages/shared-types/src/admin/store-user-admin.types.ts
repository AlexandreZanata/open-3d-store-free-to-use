import type { AdminDataResponse, AdminPaginatedResponse } from "./admin.types.js";

export type AdminStoreUserListItem = {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  cartItemCount: number;
  favoriteCount: number;
};

export type AdminStoreUserDetail = AdminStoreUserListItem & {
  updatedAt: string;
  registrationIp: string | null;
  registrationDeviceId: string | null;
};

export type AdminStoreUserListResponse = AdminPaginatedResponse<AdminStoreUserListItem>;

export type AdminStoreUserDetailResponse = AdminDataResponse<AdminStoreUserDetail>;

export type UpdateStoreUserAdminPayload = {
  isActive: boolean;
};
