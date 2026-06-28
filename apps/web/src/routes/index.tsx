import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";
import { HomeDesktopView } from "@/components/home/HomeDesktopView";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";
import { Rail } from "@/components/Rail";
import { categoriesQueryKey, useCategories } from "@/hooks/useCategories";
import { productsQueryKey, useProducts } from "@/hooks/useProducts";
import { fetchCategories } from "@/lib/api/categories";
import { fetchProducts } from "@/lib/api/products";
import { categoryPillsTrack, mobileOnly, pagePadding } from "@/lib/layout";
import { getActiveLocale } from "@/lib/locale";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: productsQueryKey({ page: 1, limit: 12 }),
        queryFn: () => fetchProducts({ page: 1, limit: 12 }, getActiveLocale()),
      }),
      context.queryClient.ensureQueryData({
        queryKey: categoriesQueryKey(),
        queryFn: () => fetchCategories(getActiveLocale()),
      }),
    ]);
  },
  head: () => ({
    meta: [{ title: "AXIS — 3D Print Catalog" }],
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
        <section className={`${pagePadding} pt-4 pb-6`}>
          <Link
            to="/search"
            className="relative block overflow-hidden rounded-2xl bg-foreground text-background shadow-card lift"
          >
            <div className="relative p-6 min-h-[180px] flex flex-col justify-end">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/60">
                {t("home.featuredLabel")}
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance max-w-[18ch]">
                {t("home.featuredTitle")}
              </h2>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
                {t("home.featuredCta")}
                <ArrowRight className="size-4" />
              </div>
            </div>
          </Link>
        </section>

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
