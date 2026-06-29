import { createContext } from "react";

export type StoreAuthContextValue = {
  user: { id: string; email: string; displayName: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
};

export const StoreAuthContext = createContext<StoreAuthContextValue | null>(null);
