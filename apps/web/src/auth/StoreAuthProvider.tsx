import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { StoreAuthContext } from "@/auth/StoreAuthContext";
import { storeMeQueryKey } from "@/auth/storeAuthKeys";
import { favoritesQueryKey } from "@/hooks/useFavorites";
import {
  fetchStoreMe,
  loginStoreUser,
  logoutStoreUser,
  registerStoreUser,
  updateStoreProfile,
} from "@/lib/api/store-auth";
import { ApiError } from "@/lib/api/client";
import { writeCart } from "@/lib/cart";
import { clearGuestCheckoutPreferences } from "@/lib/checkoutPreferences";
import {
  clearStoreSessionHint,
  hasStoreSessionHint,
  markStoreSessionHint,
} from "@/lib/storeSessionHint";

export function StoreAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authError, setAuthError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: storeMeQueryKey,
    queryFn: fetchStoreMe,
    retry: false,
    staleTime: 60_000,
    enabled: hasStoreSessionHint(),
  });

  const user =
    query.isError && query.error instanceof ApiError && query.error.status === 401
      ? null
      : (query.data?.data ?? null);

  const applySession = useCallback(
    (data: Awaited<ReturnType<typeof fetchStoreMe>>) => {
      markStoreSessionHint();
      queryClient.setQueryData(storeMeQueryKey, data);
      writeCart(data.data.cart);
      clearGuestCheckoutPreferences();
      window.dispatchEvent(new CustomEvent("print3d-cart-change"));
      void queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
    },
    [queryClient],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      try {
        applySession(await loginStoreUser({ email, password }));
      } catch (error) {
        setAuthError(resolveAuthError(error));
        throw error;
      }
    },
    [applySession],
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      setAuthError(null);
      try {
        applySession(await registerStoreUser({ email, password, displayName }));
      } catch (error) {
        setAuthError(resolveAuthError(error));
        throw error;
      }
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    await logoutStoreUser();
    clearStoreSessionHint();
    queryClient.removeQueries({ queryKey: storeMeQueryKey });
    setAuthError(null);
  }, [queryClient]);

  const updateProfile = useCallback(
    async (displayName: string) => {
      const data = await updateStoreProfile({ displayName });
      queryClient.setQueryData(storeMeQueryKey, data);
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({
      user: user
        ? { id: user.id, email: user.email, displayName: user.displayName }
        : null,
      checkoutNote: user?.checkoutNote ?? null,
      isLoading: query.isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      updateProfile,
      authError,
      clearAuthError: () => setAuthError(null),
    }),
    [authError, login, logout, query.isLoading, register, updateProfile, user],
  );

  return <StoreAuthContext.Provider value={value}>{children}</StoreAuthContext.Provider>;
}

function resolveAuthError(
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- catch boundary
  error: unknown,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Request failed";
}
