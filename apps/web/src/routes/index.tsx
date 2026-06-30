import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";
import { HomeDesktopView } from "@/components/home/HomeDesktopView";
import { HomeMobileHero } from "@/components/home/HomeMobileHero";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";
import { Rail } from "@/components/Rail";
import { categoriesQueryKey, useCategories } from "@/hooks/useCategories";
import { productsQueryKey, useProducts, resolveQueryLocale } from "@/hooks/useProducts";
import { fetchCategories } from "@/lib/api/categories";
import { fetchProducts } from "@/lib/api/products";
import {
  HOME_CATALOG_PARAMS,
  HOME_FEATURED_PARAMS,
} from "@/lib/catalogPrefetch";
import { isCatalogQueryPending, warmHomeCatalogImages } from "@/lib/catalogQuery";
import { categoryPillsTrack, mobileOnly } from "@/lib/layout";
import { preloadHeroLogo } from "@/lib/heroLogo";
import { getCurrentI18nLocale, default as i18n } from "@/i18n";

const FEATURED_PARAMS = HOME_FEATURED_PARAMS;
const CATALOG_PARAMS = HOME_CATALOG_PARAMS;

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const locale = getCurrentI18nLocale();
    await Promise.allSettled([
      context.queryClient.prefetchQuery({
        queryKey: productsQueryKey(FEATURED_PARAMS, locale),
        queryFn: () => fetchProducts(FEATURED_PARAMS, locale),
      }),
      context.queryClient.prefetchQuery({
        queryKey: productsQueryKey(CATALOG_PARAMS, locale),
        queryFn: () => fetchProducts(CATALOG_PARAMS, locale),
      }),
      context.queryClient.prefetchQuery({
        queryKey: categoriesQueryKey(locale),
        queryFn: () => fetchCategories(locale),
      }),
      preloadHeroLogo(),
    ]);
  },
  head: () => ({
    meta: [{ title: i18n.t("app.metaTitle") }],
  }),
  component: HomePage,
});

function HomePage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const locale = resolveQueryLocale(i18n.language);
  const featuredQuery = useProducts(FEATURED_PARAMS);
  const productsQuery = useProducts(CATALOG_PARAMS);
  const categoriesQuery = useCategories();
  const featuredProducts = featuredQuery.data?.data ?? [];
  const products = productsQuery.data?.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const showCatalogSkeleton = isCatalogQueryPending(productsQuery);
  const showFeaturedSkeleton = isCatalogQueryPending(featuredQuery);

  useEffect(() => {
    warmHomeCatalogImages(queryClient, locale);
  }, [
    queryClient,
    locale,
    productsQuery.dataUpdatedAt,
    featuredQuery.dataUpdatedAt,
    categoriesQuery.dataUpdatedAt,
  ]);

  return (
    <AppShell>
      <div className={mobileOnly}>
        <HomeMobileHero />

        {categories.length > 0 && (
          <section className="mb-8">
            <div className="px-4 mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight">{t("home.categoriesTitle")}</h2>
              <Link
                to="/categories"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                {t("home.viewAll")}
              </Link>
            </div>
            <div className={categoryPillsTrack}>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to="/search"
                  search={{ category: category.slug }}
                  className="shrink-0 flex items-center gap-2 px-3.5 h-10 rounded-full bg-surface ring-1 ring-hairline shadow-soft press"
                >
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(featuredProducts.length > 0 || showFeaturedSkeleton) && (
          <Rail title={t("home.featuredProducts")} action={<RailAction label={t("home.railAll")} />}>
            {showFeaturedSkeleton
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="snap-start">
                    <ProductCardSkeleton variant="wide" />
                  </div>
                ))
              : featuredProducts.map((product) => (
                  <div key={product.id} className="snap-start">
                    <ProductCard product={product} variant="wide" priority />
                  </div>
                ))}
          </Rail>
        )}

        <Rail title={t("home.allProducts")} action={<RailAction label={t("home.railAll")} />}>
          {showCatalogSkeleton
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={`all-${index}`} className="snap-start">
                  <ProductCardSkeleton variant="wide" />
                </div>
              ))
            : products.map((product) => (
                <div key={`all-${product.id}`} className="snap-start">
                  <ProductCard product={product} variant="wide" priority />
                </div>
              ))}
        </Rail>
      </div>

      <div className="hidden lg:block">
        <HomeDesktopView
          products={products}
          featuredProducts={featuredProducts}
          categories={categories}
          isLoading={showCatalogSkeleton}
          isFeaturedLoading={showFeaturedSkeleton}
          t={t}
        />
      </div>
    </AppShell>
  );
}

function RailAction({ label }: { label: string }) {
  return (
    <Link
      to="/search"
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
    >
      {label}
      <ArrowRight className="size-3.5" />
    </Link>
  );
}
