import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";
import { HomeDesktopView } from "@/components/home/HomeDesktopView";
import { HomeMobileHero } from "@/components/home/HomeMobileHero";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";
import { Rail } from "@/components/Rail";
import { categoriesQueryKey, useCategories } from "@/hooks/useCategories";
import { productsQueryKey, useProducts } from "@/hooks/useProducts";
import { fetchCategories } from "@/lib/api/categories";
import { fetchProducts } from "@/lib/api/products";
import { categoryPillsTrack, mobileOnly } from "@/lib/layout";
import { getCurrentI18nLocale, default as i18n } from "@/i18n";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const locale = getCurrentI18nLocale();
    // Do not throw on SSR when the API is down — render shell and let hooks show errors.
    await Promise.allSettled([
      context.queryClient.prefetchQuery({
        queryKey: productsQueryKey({ page: 1, limit: 12 }, locale),
        queryFn: () => fetchProducts({ page: 1, limit: 12 }, locale),
      }),
      context.queryClient.prefetchQuery({
        queryKey: categoriesQueryKey(locale),
        queryFn: () => fetchCategories(locale),
      }),
    ]);
  },
  head: () => ({
    meta: [{ title: i18n.t("app.metaTitle") }],
  }),
  component: HomePage,
});

function HomePage() {
  const { t } = useTranslation();
  const productsQuery = useProducts({ page: 1, limit: 12 });
  const categoriesQuery = useCategories();
  const products = productsQuery.data?.data ?? [];
  const categories = categoriesQuery.data ?? [];

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

        <Rail title={t("home.featuredProducts")} action={<RailAction label={t("home.railAll")} />}>
          {productsQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="snap-start">
                  <ProductCardSkeleton variant="wide" />
                </div>
              ))
            : products.slice(0, 6).map((product) => (
                <div key={product.id} className="snap-start">
                  <ProductCard product={product} variant="wide" />
                </div>
              ))}
        </Rail>

        <Rail title={t("home.allProducts")} action={<RailAction label={t("home.railAll")} />}>
          {productsQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={`all-${index}`} className="snap-start">
                  <ProductCardSkeleton variant="wide" />
                </div>
              ))
            : products.map((product) => (
                <div key={`all-${product.id}`} className="snap-start">
                  <ProductCard product={product} variant="wide" />
                </div>
              ))}
        </Rail>
      </div>

      <div className="hidden lg:block">
        <HomeDesktopView
          products={products}
          categories={categories}
          isLoading={productsQuery.isLoading}
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
