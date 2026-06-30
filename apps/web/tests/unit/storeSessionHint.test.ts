import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearStoreSessionHint,
  hasStoreSessionHint,
  markStoreSessionHint,
} from "../../src/lib/storeSessionHint";

/** Contract: docs/features/store-user-accounts.md */
describe("storeSessionHint", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts false and toggles with login/logout helpers", () => {
    clearStoreSessionHint();
    expect(hasStoreSessionHint()).toBe(false);
    markStoreSessionHint();
    expect(hasStoreSessionHint()).toBe(true);
    clearStoreSessionHint();
    expect(hasStoreSessionHint()).toBe(false);
  });
});
