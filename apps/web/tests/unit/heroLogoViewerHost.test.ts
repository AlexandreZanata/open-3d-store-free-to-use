// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { isHeroLogoSlotVisible } from "@/lib/heroLogoViewerHost";

describe("heroLogoViewerHost — docs/features/responsive-layout.md", () => {
  it("treats zero-size shells as not visible", () => {
    const shell = document.createElement("div");
    Object.defineProperty(shell, "clientWidth", { value: 0, configurable: true });
    Object.defineProperty(shell, "clientHeight", { value: 0, configurable: true });
    expect(isHeroLogoSlotVisible(shell)).toBe(false);
  });

  it("treats display:none shells as not visible", () => {
    const shell = document.createElement("div");
    shell.style.display = "none";
    document.body.appendChild(shell);
    Object.defineProperty(shell, "clientWidth", { value: 120, configurable: true });
    Object.defineProperty(shell, "clientHeight", { value: 120, configurable: true });
    expect(isHeroLogoSlotVisible(shell)).toBe(false);
    shell.remove();
  });
});
