import { useSyncExternalStore } from "react";

import { CART_CHANGE_EVENT, cartItemCount, readCart } from "@/lib/cart";

function subscribe(onStoreChange: () => void): () => void {
  const handleChange = () => onStoreChange();
  window.addEventListener(CART_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);
  return () => {
    window.removeEventListener(CART_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

function getCartCountSnapshot(): number {
  return cartItemCount(readCart());
}

export function useCartCount(): number {
  return useSyncExternalStore(subscribe, getCartCountSnapshot, () => 0);
}
