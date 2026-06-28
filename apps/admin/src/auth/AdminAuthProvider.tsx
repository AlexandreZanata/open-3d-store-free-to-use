import type { AdminLoginRequest, AdminUserSummary } from "@print3d/shared-types";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { ApiError } from "@/lib/api/client";
import { fetchAdminMe, loginAdmin, logoutAdmin } from "@/lib/api/auth";

import { AdminAuthContext, type AdminAuthContextValue } from "./useAdminAuth";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionPromise = useRef<Promise<AdminUserSummary | null> | null>(null);

  const loadSession = useCallback(async (): Promise<AdminUserSummary | null> => {
    try {
      const response = await fetchAdminMe();
      setUser(response.data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        return null;
      }
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ensureSession = useCallback(async (): Promise<AdminUserSummary | null> => {
    if (!sessionPromise.current) {
      sessionPromise.current = loadSession().finally(() => {
        sessionPromise.current = null;
      });
    }
    return sessionPromise.current;
  }, [loadSession]);

  useEffect(() => {
    void ensureSession();
  }, [ensureSession]);

  const login = useCallback(async (credentials: AdminLoginRequest) => {
    const response = await loginAdmin(credentials);
    setUser(response.data);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    setUser(null);
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({ user, isLoading, login, logout, ensureSession }),
    [user, isLoading, login, logout, ensureSession],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
