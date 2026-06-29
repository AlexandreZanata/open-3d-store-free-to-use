import { useContext } from "react";

import { StoreAuthContext } from "@/auth/StoreAuthContext";

export function useStoreAuth() {
  const context = useContext(StoreAuthContext);
  if (context === null) {
    throw new Error("useStoreAuth must be used within StoreAuthProvider");
  }
  return context;
}
