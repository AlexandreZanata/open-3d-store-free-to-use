import { describe, expect, it } from "vitest";

import { BRAND_MARK_ICON_SRC } from "../../src/lib/brandMark";

describe("brandMark (contract: docs/features/3d-viewer.md hero placeholder)", () => {
  it("uses the committed corvo PNG for header and hero loading", () => {
    expect(BRAND_MARK_ICON_SRC).toBe("/brand/corvo-logo.png");
  });
});
