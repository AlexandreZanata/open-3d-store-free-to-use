import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { ProductListItem } from "@print3d/shared-types";

import { AppShell } from "@/components/AppShell";
import { SearchDesktopView } from "@/components/search/SearchDesktopView";
import { SearchMobileView } from "@/components/search/SearchMobileView";
import { productsQueryKey } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { fetchProducts } from "@/lib/api/products";
import { desktopOnly, mobileOnly } from "@/lib/layout";
import { getActiveLocale } from "@/lib/locale";
import type { ProductQueryParams } from "@/lib/api/types";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  loader: async ({ context, location }) => {
    const search = searchSchema.parse(location.search);
    const q = search.q?.trim();
    const params = { page: 1, limit: 50, q: q || undefined };
    await context.queryClient.ensureQueryData({
      queryKey: productsQueryKey(params),
      queryFn: () => fetchProducts(params, getActiveLocale()),
    });
  },
  head: () => ({
    meta: [{ title: "Search — AXIS" }],
  }),
  component: SearchPage,
});

type MaterialFilter = ProductQueryParams["material"] | undefined;

const MATERIALS = ["PLA", "PETG", "ABS", "TPU", "RESIN"] as const;

function SearchPage() {
  const { t } = useTranslation();
  const { q: initialQ, category: initialCategory } = Route.useSearch();
  const [query, setQuery] = useState(initialQ ?? "");
  const [category, setCategory] = useState<string | null>(initialCategory ?? null);
  const [material, setMaterial] = useState<MaterialFilter>(undefined);
  const [openFilters, setOpenFilters] = useState(Boolean(initialCategory));

  const params = useMemo(
    () => ({
      page: 1,
      limit: 50,
      q: query.trim() || undefined,
      category: category ?? undefined,
      material,
    }),
    [query, category, material],
  );

  const productsQuery = useProducts(params);
  const categoriesQuery = useCategories();
  const results: ProductListItem[] = productsQuery.data?.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const filterProps = {
    category,
    material,
    categories,
    materials: MATERIALS,
    onCategoryChange: setCategory,
    onMaterialChange: setMaterial,
    t,
  };

  return (
    <AppShell showSearch={false} title={t("search.title")}>
      <div className={mobileOnly}>
        <SearchMobileView
          query={query}
          onQueryChange={setQuery}
          onQueryClear={() => setQuery("")}
          openFilters={openFilters}
          onToggleFilters={() => setOpenFilters((v) => !v)}
          results={results}
          isLoading={productsQuery.isLoading}
          filterProps={filterProps}
        />
      </div>

      <div className={desktopOnly}>
        <SearchDesktopView
          query={query}
          onQueryChange={setQuery}
          onQueryClear={() => setQuery("")}
          results={results}
          isLoading={productsQuery.isLoading}
          {...filterProps}
        />
      </div>
    </AppShell>
  );
}
