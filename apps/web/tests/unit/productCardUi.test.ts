import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { MaterialType } from "@print3d/shared-types";

import { MaterialBadge } from "@/components/ProductCardUi";
import { formatMaterialLabel, materialBadgeClass, materialBadgeIsSolid } from "@/lib/productCardUi";

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
    expect(petgHf).toContain("bg-orange-500");
    expect(petgHf).toContain("text-white");
    expect(petgHf).not.toContain("/15");
    expect(materialBadgeIsSolid("PETG_HF")).toBe(true);
    expect(materialBadgeIsSolid("PLA")).toBe(false);
  });

  it("renders PETG HF badge with solid orange fill for mobile thumbnails", () => {
    const html = renderToStaticMarkup(
      createElement(MaterialBadge, { material: "PETG_HF", label: "PETG HF" }),
    );
    expect(html).toContain("PETG HF");
    expect(html).toContain("bg-orange-500");
    expect(html).toContain("text-white");
    expect(html).not.toContain("bg-orange-500/15");
    expect(html).not.toContain("backdrop-blur");
  });
});
