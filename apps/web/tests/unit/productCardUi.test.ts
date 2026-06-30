import { describe, expect, it } from "vitest";

import type { MaterialType } from "@print3d/shared-types";

import { formatMaterialLabel, materialBadgeClass } from "@/lib/productCardUi";

describe("productCardUi — docs/features/responsive-layout.md", () => {
  it("formats material enum labels for display", () => {
    expect(formatMaterialLabel("PETG_HF" as MaterialType)).toBe("PETG HF");
    expect(formatMaterialLabel("PLA" as MaterialType)).toBe("PLA");
  });

  it("assigns a distinct badge style per material type", () => {
    const pla = materialBadgeClass("PLA");
    const petgHf = materialBadgeClass("PETG_HF");
    expect(pla).not.toBe(petgHf);
    expect(pla).toContain("bg-sky-500/15");
    expect(petgHf).toContain("bg-orange-500/15");
  });
});
