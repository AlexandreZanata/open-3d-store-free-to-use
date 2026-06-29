import { describe, expect, it } from "vitest";

import { brandFaviconHeadLinks } from "../../src/lib/brandFavicons";

describe("brandFavicons — storefront tab icons", () => {
  it("uses SVG + light/dark PNG fallbacks (synced with admin index.html)", () => {
    expect(brandFaviconHeadLinks[0]).toEqual({
      rel: "icon",
      href: "/favicon.svg",
      type: "image/svg+xml",
    });
    expect(brandFaviconHeadLinks.some((link) => link.href === "/favicon-dark.png")).toBe(true);
    expect(brandFaviconHeadLinks.some((link) => link.href === "/favicon-light.png")).toBe(true);
    expect(
      brandFaviconHeadLinks.some((link) => "media" in link && link.media?.includes("dark")),
    ).toBe(true);
    expect(
      brandFaviconHeadLinks.some((link) => "media" in link && link.media?.includes("light")),
    ).toBe(true);
  });
});
