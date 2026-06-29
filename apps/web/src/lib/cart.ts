import type { ProductListItem } from "@print3d/shared-types";

const CART_STORAGE_KEY = "print3d-cart";
export const CART_CHANGE_EVENT = "print3d-cart-change";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  thumbnailUrl: string;
  basePriceDisplay: string;
  quantity: number;
  selectedOptions: Record<string, string>;
};

export function readCart(): CartItem[] {
  if (typeof localStorage === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT));
}

export function addToCart(product: ProductListItem, quantity = 1): CartItem[] {
  const items = readCart();
  const existing = items.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      thumbnailUrl: product.thumbnailUrl,
      basePriceDisplay: product.basePriceDisplay,
      quantity,
      selectedOptions: {},
    });
  }
  writeCart(items);
  return items;
}

export function updateCartQuantity(productId: string, quantity: number): CartItem[] {
  const items = readCart()
    .map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
    )
    .filter((item) => item.quantity > 0);
  writeCart(items);
  return items;
}

export function removeFromCart(productId: string): CartItem[] {
  const items = readCart().filter((item) => item.productId !== productId);
  writeCart(items);
  return items;
}

export function clearCart(): void {
  writeCart([]);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
