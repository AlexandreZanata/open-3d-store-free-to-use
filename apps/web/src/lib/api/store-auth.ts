import type {
  StoreCartItem,
  StoreCartResponse,
  StoreLoginRequest,
  StoreMeResponse,
  StoreRegisterRequest,
  StoreSaveCartRequest,
  StoreUpdateProfileRequest,
} from "@print3d/shared-types";

import { apiFetch, apiPatch, apiPost } from "@/lib/api/client";
import { deviceHeaders } from "@/lib/device";
import { visitorHeaders } from "@/lib/visitor";
import { readCart, type CartItem } from "@/lib/cart";
import { readGuestCheckoutNoteForAuth } from "@/lib/checkoutPreferences";

function authHeaders(): HeadersInit {
  return { ...deviceHeaders(), ...visitorHeaders() };
}

function withCheckoutContext<T extends StoreLoginRequest | StoreRegisterRequest>(body: T): T {
  return { ...body, cart: body.cart ?? readCart(), checkoutNote: readGuestCheckoutNoteForAuth() };
}

export async function fetchStoreMe(): Promise<StoreMeResponse> {
  return apiFetch<StoreMeResponse>("/me");
}

export async function registerStoreUser(payload: StoreRegisterRequest): Promise<StoreMeResponse> {
  const body = withCheckoutContext(payload);
  return apiPost<StoreMeResponse>("/auth/register", body, { headers: authHeaders() });
}

export async function loginStoreUser(payload: StoreLoginRequest): Promise<StoreMeResponse> {
  const body = withCheckoutContext(payload);
  return apiPost<StoreMeResponse>("/auth/login", body, { headers: authHeaders() });
}

export async function logoutStoreUser(): Promise<void> {
  await apiFetch<void>("/auth/logout", { method: "POST", headers: authHeaders() });
}

export async function updateStoreProfile(
  payload: StoreUpdateProfileRequest,
): Promise<StoreMeResponse> {
  return apiPatch<StoreMeResponse>("/me", payload, { headers: authHeaders() });
}

export async function saveStoreCart(cart: CartItem[]): Promise<StoreCartResponse> {
  const body: StoreSaveCartRequest = { cart };
  return apiFetch<StoreCartResponse>("/me/cart", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });
}
