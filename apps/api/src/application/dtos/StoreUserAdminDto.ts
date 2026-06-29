import type {
  AdminStoreUserDetail,
  AdminStoreUserListItem,
} from "@print3d/shared-types";

import type {
  StoreUserAdminDetailRow,
  StoreUserAdminListRow,
} from "../../domain/repositories/IStoreUserRepository.js";

export function toAdminStoreUserListDto(row: StoreUserAdminListRow): AdminStoreUserListItem {
  return {
    id: row.user.id,
    email: row.user.email,
    displayName: row.user.displayName,
    isActive: row.user.isActive,
    createdAt: row.user.createdAt.toISOString(),
    cartItemCount: row.cartItemCount,
    favoriteCount: row.favoriteCount,
  };
}

export function toAdminStoreUserDetailDto(row: StoreUserAdminDetailRow): AdminStoreUserDetail {
  return {
    ...toAdminStoreUserListDto(row),
    updatedAt: row.user.updatedAt.toISOString(),
    registrationIp: row.registrationIp,
    registrationDeviceId: row.registrationDeviceId,
  };
}
