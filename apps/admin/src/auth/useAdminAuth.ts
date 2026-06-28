import type { AdminLoginRequest, AdminUserSummary } from "@print3d/shared-types";
import { createContext, useContext } from "react";

export type AdminAuthContextValue = {
  user: AdminUserSummary | null;
  isLoading: boolean;
  login: (credentials: AdminLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  ensureSession: () => Promise<AdminUserSummary | null>;
};

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
