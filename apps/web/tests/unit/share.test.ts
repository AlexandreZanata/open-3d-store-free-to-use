import { describe, expect, it } from "vitest";

import {
  buildEmailShareUrl,
  buildProductSharePath,
  buildProductSharePayload,
  buildProductShareUrl,
  buildWhatsAppShareUrl,
  formatShareClipboardText,
} from "@/lib/share";

describe("product share (contract: docs/features/product-share.md)", () => {
  const input = {
    slug: "dragon-figurine",
    name: "Dragon Figurine",
    shortDescription: "Tabletop dragon miniature",
  };
  const origin = "https://shop.example.com";

  it("builds canonical product URL for clipboard and deep links", () => {
    expect(buildProductSharePath("dragon-figurine")).toBe("/product/dragon-figurine");
    expect(buildProductShareUrl("dragon-figurine", origin)).toBe(
      "https://shop.example.com/product/dragon-figurine",
    );
  });

  it("builds Web Share payload with title, text, and url", () => {
    const payload = buildProductSharePayload(input, origin);
    expect(payload).toEqual({
      title: "Dragon Figurine",
      text: "Dragon Figurine — Tabletop dragon miniature",
      url: "https://shop.example.com/product/dragon-figurine",
    });
    expect(formatShareClipboardText(payload)).toBe(
      "Dragon Figurine — Tabletop dragon miniature\nhttps://shop.example.com/product/dragon-figurine",
    );
  });

  it("builds WhatsApp and email share links with encoded message", () => {
    const payload = buildProductSharePayload(input, origin);
    expect(buildWhatsAppShareUrl(payload)).toBe(
      "https://wa.me/?text=Dragon%20Figurine%20%E2%80%94%20Tabletop%20dragon%20miniature%0Ahttps%3A%2F%2Fshop.example.com%2Fproduct%2Fdragon-figurine",
    );
    expect(buildEmailShareUrl(payload)).toContain("mailto:?subject=Dragon%20Figurine");
    expect(buildEmailShareUrl(payload)).toContain(
      encodeURIComponent("https://shop.example.com/product/dragon-figurine"),
    );
  });
});
