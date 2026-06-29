import { describe, expect, it, vi } from "vitest";

import { invalidateCatalogQueries } from "@/hooks/useCatalogRealtime";

describe("useCatalogRealtime — docs/features/catalog-realtime.md", () => {
  it("invalidates products, categories, and product detail queries", () => {
    const invalidateQueries = vi.fn();
    const queryClient = { invalidateQueries } as never;

    invalidateCatalogQueries(queryClient);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["products"],
      refetchType: "all",
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["categories"],
      refetchType: "all",
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["product"],
      refetchType: "all",
    });
  });
});
