import { describe, expect, it } from "vitest";

import {
  categoryGridCols,
  desktopOnly,
  mainBottomPad,
  mobileOnly,
  productCardWideWidth,
  productGridCols,
  shellMaxWidth,
} from "../src/lib/layout";

describe("responsive layout tokens", () => {
  it("keeps mobile shell width at max-w-2xl", () => {
    expect(shellMaxWidth).toContain("max-w-2xl");
    expect(mainBottomPad).toContain("pb-24");
    expect(productCardWideWidth).toContain("w-[78vw]");
  });

  it("adds desktop overrides only at lg breakpoint", () => {
    expect(shellMaxWidth).toContain("lg:max-w-7xl");
    expect(mainBottomPad).toContain("lg:pb-8");
    expect(productGridCols).toContain("lg:grid-cols-3");
    expect(categoryGridCols).toContain("xl:grid-cols-4");
    expect(productCardWideWidth).toContain("lg:w-full");
  });

  it("separates mobile and desktop navigation visibility", () => {
    expect(mobileOnly).toBe("lg:hidden");
    expect(desktopOnly).toBe("hidden lg:block");
  });
});
