import { afterEach, describe, expect, it, vi } from "vitest";

import { isValidUuid, randomId } from "../../src/lib/randomId";

describe("randomId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses crypto.randomUUID when available", () => {
    const uuid = "01935abc-def0-7000-8000-000000000001";
    vi.stubGlobal("crypto", { randomUUID: () => uuid });
    expect(randomId()).toBe(uuid);
  });

  it("falls back to a valid UUID v4 on HTTP (non-secure context)", () => {
    vi.stubGlobal("crypto", { getRandomValues: (bytes: Uint8Array) => bytes.fill(7) });
    const id = randomId();
    expect(isValidUuid(id)).toBe(true);
  });
});

describe("isValidUuid", () => {
  it("rejects legacy non-uuid visitor ids", () => {
    expect(isValidUuid("mqzwbp0i-ujozahlk")).toBe(false);
  });
});
