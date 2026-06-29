import { useEffect, useRef } from "react";

import { useStoreAuth } from "@/auth/useStoreAuth";
import { saveStoreCart } from "@/lib/api/store-auth";
import { CART_CHANGE_EVENT, readCart } from "@/lib/cart";

const SYNC_DELAY_MS = 600;

/** Persists cart to the server when the shopper is signed in. */
export function useCartServerSync() {
  const { isAuthenticated } = useStoreAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    function scheduleSync() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        void saveStoreCart(readCart()).catch(() => undefined);
      }, SYNC_DELAY_MS);
    }

    window.addEventListener(CART_CHANGE_EVENT, scheduleSync);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, scheduleSync);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isAuthenticated]);
}
