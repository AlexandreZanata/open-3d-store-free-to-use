import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";
import { CategoryCard } from "@/components/CategoryCard";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import {
  CATEGORIES_TAB_PARAMS,
  ensureCategoriesTabCatalog,
} from "@/lib/catalogPrefetch";
import { isCatalogQueryPending } from "@/lib/catalogQuery";
import { categoryGridCols, desktopOnly, pagePadding } from "@/lib/layout";
import { getCurrentI18nLocale, default as i18n } from "@/i18n";
import { brandPageTitle } from "@/lib/brand";

export const Route = createFileRoute("/categories")({
  loader: async ({ context }) => {
    const locale = getCurrentI18nLocale();
    await ensureCategoriesTabCatalog(context.queryClient, locale);
  },
  head: () => ({
    meta: [{ title: brandPageTitle(i18n.t("categories.title")) }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { t } = useTranslation();
  const categoriesQuery = useCategories();
  const productsQuery = useProducts(CATEGORIES_TAB_PARAMS);
  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data?.data ?? [];

  return (
    <AppShell showSearch={false} title={t("categories.title")}>
      {isCatalogQueryPending(categoriesQuery) ? (
        <div className={`${pagePadding} py-4 lg:py-8`}>
          <div className={categoryGridCols}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-square rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className={`${pagePadding} py-4 lg:py-8`}>
          <div className={`${desktopOnly} mb-6`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("nav.categories")}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{t("categories.title")}</h2>
          </div>
          <div className={categoryGridCols}>
            {categories.map((category) => {
              const count = products.filter((product) => product.categoryId === category.id).length;
              return (
                <CategoryCard key={category.slug} category={category} productCount={count} />
              );
            })}
          </div>
        </div>
      )}
      {categoriesQuery.isError && (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground">
          {t("product.errorHint")}
        </div>
      )}
    </AppShell>
  );
}
