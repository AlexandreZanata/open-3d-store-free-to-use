import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { ProductListItem } from "@print3d/shared-types";

import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/LoadingSkeletons";
import { SearchFiltersPanel } from "@/components/SearchFiltersPanel";
import { productsQueryKey } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { fetchProducts } from "@/lib/api/products";
import { desktopOnly, mobileOnly, pagePadding, productGridCols, stickyBelowDesktopSubHeader, stickyBelowHeader } from "@/lib/layout";
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
      <div className="lg:grid lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-8 lg:px-8">
        <aside className={`${desktopOnly} pt-6 pr-2`} aria-label={t("search.filters")}>
          <h2 className="text-sm font-semibold tracking-tight mb-4">{t("search.filters")}</h2>
          <SearchFiltersPanel {...filterProps} />
        </aside>

        <div>
          <div
            className={`sticky ${stickyBelowHeader} ${stickyBelowDesktopSubHeader} z-30 bg-background/95 backdrop-blur-md border-b border-hairline`}
          >
            <div className={`${pagePadding} py-3 flex items-center gap-2`}>
              <div className="flex-1 flex items-center gap-2 bg-muted rounded-full h-10 px-3.5 lg:max-w-2xl">
                <SearchIcon className="size-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("search.placeholder")}
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label={t("search.clear")}
                    className="text-muted-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setOpenFilters((v) => !v)}
                className={`${mobileOnly} size-10 grid place-items-center rounded-full ring-1 ring-hairline press ${
                  openFilters ? "bg-foreground text-background" : "bg-surface"
                }`}
                aria-label={t("search.filters")}
              >
                <SlidersHorizontal className="size-4" />
              </button>
            </div>

            {openFilters && (
              <div
                className={`${mobileOnly} ${pagePadding} pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200`}
              >
                <SearchFiltersPanel {...filterProps} />
              </div>
            )}
          </div>

          <div className={`${pagePadding} py-4 text-xs text-muted-foreground uppercase tracking-wider`}>
            {t("search.results", { count: results.length })}
          </div>

          {productsQuery.isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : results.length === 0 ? (
            <EmptyResults />
          ) : (
            <div className={`${pagePadding} ${productGridCols}`}>
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function EmptyResults() {
  const { t } = useTranslation();
  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto size-14 rounded-full bg-muted grid place-items-center mb-4">
        <SearchIcon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">{t("search.emptyTitle")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("search.emptyHint")}</p>
    </div>
  );
}
