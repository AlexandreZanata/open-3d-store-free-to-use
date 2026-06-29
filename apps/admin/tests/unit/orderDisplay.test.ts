/**
 * Contract: docs/features/whatsapp-flow.md — order display ID format.
 */
import { describe, expect, it } from "vitest";

import {
  daysAgoStartOfDayIso,
  formatOrderDisplayId,
  ordersListLookbackFrom,
} from "@/lib/orderDisplay";

describe("formatOrderDisplayId — whatsapp-flow.md", () => {
  it("shows first 8 hex characters uppercase without dashes", () => {
    expect(formatOrderDisplayId("019f102f-0b64-78b3-a7a8-9511930a93f0")).toBe("019F102F");
  });
});

describe("orders list date range", () => {
  it("uses start-of-day ISO so repeated calls stay stable for query keys", () => {
    expect(daysAgoStartOfDayIso(30)).toBe(daysAgoStartOfDayIso(30));
    expect(ordersListLookbackFrom()).toBe(ordersListLookbackFrom());
  });
});
