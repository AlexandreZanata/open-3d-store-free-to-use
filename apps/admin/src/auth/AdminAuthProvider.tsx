import type { AdminLoginRequest, AdminUserSummary } from "@print3d/shared-types";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { registerAdminSessionCoordinator } from "@/lib/api/adminSessionCoordinator";
import { ApiError } from "@/lib/api/client";
import { fetchAdminMe, loginAdmin, logoutAdmin, refreshAdminSession } from "@/lib/api/auth";
import { router } from "@/router";

import { AdminAuthContext, type AdminAuthContextValue } from "./useAdminAuth";

const SESSION_REFRESH_MS = 15 * 60 * 1000;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionPromise = useRef<Promise<AdminUserSummary | null> | null>(null);
  const userRef = useRef<AdminUserSummary | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

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
      if (error instanceof ApiError && error.status === 429) {
        return userRef.current;
      }
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ensureSession = useCallback(async (): Promise<AdminUserSummary | null> => {
    if (userRef.current) {
      return userRef.current;
    }
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

  useEffect(() => {
    return registerAdminSessionCoordinator({
      tryRefresh: async () => {
        try {
          const response = await refreshAdminSession();
          setUser(response.data);
          return true;
        } catch {
          return false;
        }
      },
      onSessionExpired: () => {
        setUser(null);
        void router.navigate({ to: "/login" });
      },
    });
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const refresh = () => {
      void refreshAdminSession()
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          if (error instanceof ApiError && error.status === 401) {
            setUser(null);
          }
        });
    };

    const intervalId = window.setInterval(refresh, SESSION_REFRESH_MS);
    return () => window.clearInterval(intervalId);
  }, [user]);

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
