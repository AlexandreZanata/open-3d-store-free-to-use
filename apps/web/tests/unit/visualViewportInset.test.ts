/**
 * Contract: docs/features/responsive-layout.md — Mobile tab bar visual viewport pinning
 */
import { describe, expect, it } from "vitest";

import {
  pickStableBottomInsetPx,
  readVisualViewportBottomInsetPx,
} from "../../src/lib/visualViewportInset";

describe("readVisualViewportBottomInsetPx", () => {
  it("returns 0 when visual viewport fills the layout viewport", () => {
    expect(readVisualViewportBottomInsetPx(844, { height: 844, offsetTop: 0 })).toBe(0);
  });

  it("returns gap when browser chrome shrinks visual viewport height", () => {
    expect(readVisualViewportBottomInsetPx(844, { height: 800, offsetTop: 0 })).toBe(44);
  });

  it("subtracts visual viewport offsetTop from the bottom gap", () => {
    expect(readVisualViewportBottomInsetPx(844, { height: 800, offsetTop: 20 })).toBe(24);
  });

  it("returns 0 when visualViewport is unavailable", () => {
    expect(readVisualViewportBottomInsetPx(844, null)).toBe(0);
    expect(readVisualViewportBottomInsetPx(844, undefined)).toBe(0);
  });
});

describe("pickStableBottomInsetPx", () => {
  it("holds the higher inset when measured briefly drops during toolbar animation", () => {
    expect(pickStableBottomInsetPx(48, 0)).toBe(48);
  });

  it("tracks increases immediately", () => {
    expect(pickStableBottomInsetPx(0, 48)).toBe(48);
    expect(pickStableBottomInsetPx(24, 48)).toBe(48);
  });
});
