import type { AdminRole } from "@print3d/shared-types";

export type AdminUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminSession = {
  id: string;
  adminUserId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
};

export type CreateAdminSessionInput = {
  adminUserId: string;
  tokenHash: string;
  expiresAt: Date;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
};

export type CreateAdminUserInput = {
  email: string;
  passwordHash: string;
  role?: AdminRole | undefined;
};
