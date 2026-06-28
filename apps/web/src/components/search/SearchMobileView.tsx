import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProductListItem } from "@print3d/shared-types";

import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/LoadingSkeletons";
import { SearchFiltersPanel } from "@/components/SearchFiltersPanel";
import { pagePadding, productGridCols, stickyBelowHeader } from "@/lib/layout";
import type { ProductQueryParams } from "@/lib/api/types";

type FilterProps = {
  category: string | null;
  material: ProductQueryParams["material"] | undefined;
  categories: { slug: string; name: string }[];
  materials: readonly ProductQueryParams["material"][];
  onCategoryChange: (slug: string | null) => void;
  onMaterialChange: (material: ProductQueryParams["material"] | undefined) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
};

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onQueryClear: () => void;
  openFilters: boolean;
  onToggleFilters: () => void;
  results: ProductListItem[];
  isLoading: boolean;
  filterProps: FilterProps;
};

/** Frozen mobile search UI — no `lg:` overrides. */
export function SearchMobileView({
  query,
  onQueryChange,
  onQueryClear,
  openFilters,
  onToggleFilters,
  results,
  isLoading,
  filterProps,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div
        className={`sticky ${stickyBelowHeader} z-30 bg-background/95 backdrop-blur-md border-b border-hairline`}
      >
        <div className={`${pagePadding} py-3 flex items-center gap-2`}>
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-full h-10 px-3.5">
            <SearchIcon className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t("search.placeholder")}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={onQueryClear}
                aria-label={t("search.clear")}
                className="text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <button
            onClick={onToggleFilters}
            className={`size-10 grid place-items-center rounded-full ring-1 ring-hairline press ${
              openFilters ? "bg-foreground text-background" : "bg-surface"
            }`}
            aria-label={t("search.filters")}
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>

        {openFilters && (
          <div
            className={`${pagePadding} pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            <SearchFiltersPanel {...filterProps} />
          </div>
        )}
      </div>

      <div className={`${pagePadding} py-4 text-xs text-muted-foreground uppercase tracking-wider`}>
        {t("search.results", { count: results.length })}
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : results.length === 0 ? (
        <SearchMobileEmpty />
      ) : (
        <div className={`${pagePadding} ${productGridCols}`}>
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

function SearchMobileEmpty() {
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
