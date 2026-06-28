import type { AdminRole } from "@print3d/shared-types";

import type { AdminUser } from "../../domain/entities/AdminUser.js";

export type AdminAuthDto = {
  id: string;
  email: string;
  role: AdminRole;
  lastLoginAt: string | null;
};

export function toAdminAuthDto(user: AdminUser): AdminAuthDto {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}

export type LoginAdminResult = {
  admin: AdminAuthDto;
  sessionToken: string;
};
