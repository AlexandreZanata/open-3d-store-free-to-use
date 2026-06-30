const SESSION_HINT_KEY = "print3d-store-session-hint";

/** HttpOnly cookie is not readable in JS — hint is set after login/register. */
export function hasStoreSessionHint(): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }
  return localStorage.getItem(SESSION_HINT_KEY) === "1";
}

export function markStoreSessionHint(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(SESSION_HINT_KEY, "1");
}

export function clearStoreSessionHint(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(SESSION_HINT_KEY);
}
