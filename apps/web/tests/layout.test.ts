import { describe, expect, it } from "vitest";

import {
  categoryGridCols,
  desktopHeroSurface,
  desktopMainSurface,
  desktopOnly,
  footerBottomPad,
  mainBottomPad,
  mobileTopPad,
  mobileOnly,
  productCardWideWidth,
  productGridCols,
  searchCatalogGridCols,
  railInner,
  railScroll,
  shellMaxWidth,
  stickyBelowHeader,
} from "../src/lib/layout";

describe("responsive layout tokens", () => {
  it("keeps mobile shell width at max-w-2xl", () => {
    expect(shellMaxWidth).toContain("max-w-2xl");
    expect(mainBottomPad).toContain("pb-8");
    expect(productCardWideWidth).toContain("calc(100vw-2rem)");
  });

  it("adds desktop overrides only at lg breakpoint", () => {
    expect(shellMaxWidth).toContain("lg:max-w-7xl");
    expect(mainBottomPad).toContain("lg:pb-8");
    expect(productGridCols).toContain("lg:grid-cols-3");
    expect(categoryGridCols).toContain("xl:grid-cols-4");
    expect(productCardWideWidth).toContain("lg:w-full");
    expect(desktopMainSurface).toContain("lg:");
    expect(desktopHeroSurface).toContain("rounded-3xl");
  });

  it("separates mobile and desktop navigation visibility", () => {
    expect(mobileOnly).toBe("lg:hidden");
    expect(desktopOnly).toBe("hidden lg:block");
  });

  it("defines desktop header sticky offsets", () => {
    expect(stickyBelowHeader).toContain("top-14");
    expect(stickyBelowHeader).toContain("lg:top-[6.5rem]");
  });

  it("defines desktop search catalog grid", () => {
    expect(searchCatalogGridCols).toContain("grid-cols-2");
    expect(searchCatalogGridCols).toContain("xl:grid-cols-3");
  });

  it("defines horizontal rail padding on inner track", () => {
    expect(railInner).toContain("px-4");
    expect(railInner).toContain("w-max");
    expect(railScroll).toContain("scroll-px-4");
  });

  it("offsets main below fixed mobile header", () => {
    expect(mobileTopPad).toContain("pt-14");
    expect(mobileTopPad).toContain("lg:pt-0");
  });

  it("clears mobile tab bar via footer padding token", () => {
    expect(footerBottomPad).toContain("pb-[4.75rem]");
    expect(footerBottomPad).toContain("lg:pb-0");
  });
});
