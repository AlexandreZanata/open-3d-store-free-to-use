/**
 * Contract: docs/api/admin-contract.md — basePrice integer BRL cents (e.g. 4500 = R$ 45,00).
 */
import { describe, expect, it } from "vitest";

import { centsToReaisInput, formatBrlCents, reaisToCents } from "@/lib/money";

describe("money helpers — admin contract basePrice cents", () => {
  it("converts contract example R$ 45,00 to 4500 cents", () => {
    expect(reaisToCents("45.00")).toBe(4500);
    expect(reaisToCents("45,00")).toBe(4500);
  });

  it("formats 4500 cents as R$ 45,00 for display", () => {
    expect(formatBrlCents(4500)).toBe("R$ 45,00");
    expect(centsToReaisInput(4500)).toBe("45.00");
  });

  it("rejects negative or invalid input", () => {
    expect(Number.isNaN(reaisToCents("-1"))).toBe(true);
    expect(Number.isNaN(reaisToCents(""))).toBe(true);
  });
});
