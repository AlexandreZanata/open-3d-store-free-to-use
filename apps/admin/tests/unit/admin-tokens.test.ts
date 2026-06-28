/**
 * Contract: .local/phases/13-admin-panel-scaffold.md — PrintStatus badge colors.
 */
import { describe, expect, it } from "vitest";

import { getPrintStatusLabel, printStatusColors } from "@/lib/admin-tokens";

describe("admin design tokens — Phase 13 status map", () => {
  it("defines labels for all PrintStatus values", () => {
    expect(getPrintStatusLabel("active")).toBe("Active");
    expect(getPrintStatusLabel("out_of_stock")).toBe("Out of stock");
    expect(getPrintStatusLabel("discontinued")).toBe("Discontinued");
  });

  it("uses distinct token classes per status", () => {
    expect(printStatusColors.active.dot).toContain("status-active");
    expect(printStatusColors.out_of_stock.dot).toContain("status-out-of-stock");
    expect(printStatusColors.discontinued.dot).toContain("status-discontinued");
  });
});
