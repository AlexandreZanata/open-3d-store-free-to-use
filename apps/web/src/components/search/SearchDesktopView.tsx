import { Search as SearchIcon, X } from "lucide-react";
import type { TFunction } from "i18next";
import type { ProductListItem } from "@print3d/shared-types";

import { CatalogProductCard } from "@/components/search/CatalogProductCard";
import { SearchFiltersPanel } from "@/components/SearchFiltersPanel";
import { productCardImageAspect, searchCatalogGridCols, stickyBelowHeader } from "@/lib/layout";
import type { ProductQueryParams } from "@/lib/api/types";

type CategoryOption = { slug: string; name: string };

type FilterProps = {
  category: string | null;
  material: ProductQueryParams["material"] | undefined;
  categories: CategoryOption[];
  materials: readonly ProductQueryParams["material"][];
  onCategoryChange: (slug: string | null) => void;
  onMaterialChange: (material: ProductQueryParams["material"] | undefined) => void;
};

type Props = FilterProps & {
  query: string;
  onQueryChange: (value: string) => void;
  onQueryClear: () => void;
  results: ProductListItem[];
  isLoading: boolean;
  t: TFunction;
};

export function SearchDesktopView({
  query,
  onQueryChange,
  onQueryClear,
  results,
  isLoading,
  t,
  ...filterProps
}: Props) {
  const activeFilters = buildActiveFilters({ ...filterProps, t });

  return (
    <div className="px-8 py-8">
      <header className="mb-10 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          {t("app.tagline")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t("search.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {t("search.desktopSubtitle")}
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,300px)_1fr] gap-10 items-start">
        <aside
          className={`sticky ${stickyBelowHeader} self-start`}
          aria-label={t("search.filters")}
        >
          <SearchFiltersPanel {...filterProps} t={t} variant="desktop" />
        </aside>

        <div className="space-y-6 min-w-0">
          <div className="bg-surface ring-1 ring-hairline rounded-2xl p-5 shadow-soft">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("search.keywordLabel")}
            </label>
            <div className="mt-3 flex items-center gap-3 h-12 px-4 rounded-xl bg-muted/80 ring-1 ring-hairline">
              <SearchIcon className="size-5 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={t("search.placeholder")}
                className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  onClick={onQueryClear}
                  aria-label={t("search.clear")}
                  className="size-8 grid place-items-center rounded-full text-muted-foreground hover:bg-background press"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold tracking-tight">
              {t("search.results", { count: results.length })}
            </p>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((label) => (
                  <span
                    key={label}
                    className="inline-flex h-8 items-center px-3 rounded-full bg-surface ring-1 ring-hairline text-xs font-medium text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <CatalogGridSkeleton />
          ) : results.length === 0 ? (
            <SearchEmptyState t={t} />
          ) : (
            <div className={searchCatalogGridCols}>
              {results.map((product) => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildActiveFilters(
  { category, material, categories, t }: FilterProps & { t: TFunction },
) {
  const labels: string[] = [];
  if (category) {
    const match = categories.find((item) => item.slug === category);
    if (match) labels.push(match.name);
  }
  if (material) labels.push(t(`material.${material}`));
  return labels;
}

function CatalogGridSkeleton() {
  return (
    <div className={searchCatalogGridCols}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-2xl ring-1 ring-hairline overflow-hidden animate-pulse">
          <div className={`${productCardImageAspect} bg-muted`} />
          <div className="p-5 space-y-3">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-5 w-3/4 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchEmptyState({ t }: { t: TFunction }) {
  return (
    <div className="rounded-2xl bg-surface ring-1 ring-hairline px-8 py-16 text-center shadow-soft">
      <div className="mx-auto size-16 rounded-full bg-muted grid place-items-center mb-5">
        <SearchIcon className="size-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{t("search.emptyTitle")}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">{t("search.emptyHint")}</p>
    </div>
  );
}
