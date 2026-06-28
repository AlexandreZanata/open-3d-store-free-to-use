/**
 * Contract: docs/features/whatsapp-flow.md — order display ID format.
 */
import { describe, expect, it } from "vitest";

import { formatOrderDisplayId } from "@/lib/orderDisplay";

describe("formatOrderDisplayId — whatsapp-flow.md", () => {
  it("shows first 8 hex characters uppercase without dashes", () => {
    expect(formatOrderDisplayId("019f102f-0b64-78b3-a7a8-9511930a93f0")).toBe("019F102F");
  });
});
