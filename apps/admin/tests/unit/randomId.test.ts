import { afterEach, describe, expect, it, vi } from "vitest";

import { randomId } from "../../src/lib/randomId";

describe("randomId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses crypto.randomUUID when available", () => {
    const uuid = "01935abc-def0-7000-8000-000000000001";
    vi.stubGlobal("crypto", { randomUUID: () => uuid });
    expect(randomId()).toBe(uuid);
  });

  it("falls back when randomUUID is missing (HTTP / non-secure context)", () => {
    vi.stubGlobal("crypto", {});
    const id = randomId();
    expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });
});
