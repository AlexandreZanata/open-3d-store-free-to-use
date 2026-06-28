import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";
import { categoriesQueryKey } from "@/hooks/useCategories";
import { productsQueryKey } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { fetchCategories } from "@/lib/api/categories";
import { fetchProducts } from "@/lib/api/products";
import { getActiveLocale } from "@/lib/locale";

export const Route = createFileRoute("/categories")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: categoriesQueryKey(),
        queryFn: () => fetchCategories(getActiveLocale()),
      }),
      context.queryClient.ensureQueryData({
        queryKey: productsQueryKey({ page: 1, limit: 50 }),
        queryFn: () => fetchProducts({ page: 1, limit: 50 }, getActiveLocale()),
      }),
    ]);
  },
  head: () => ({
    meta: [{ title: "Categories — AXIS" }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { t } = useTranslation();
  const categoriesQuery = useCategories();
  const productsQuery = useProducts({ page: 1, limit: 50 });
  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data?.data ?? [];

  return (
    <AppShell showSearch={false} title={t("categories.title")}>
      {categoriesQuery.isLoading ? (
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-[5/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const count = products.filter((product) => product.categoryId === category.id).length;
            return (
              <Link
                key={category.slug}
                to="/search"
                search={{ category: category.slug }}
                className="aspect-[5/4] rounded-2xl bg-surface ring-1 ring-hairline p-4 flex flex-col justify-end shadow-soft lift"
              >
                <div>
                  <div className="text-sm font-semibold tracking-tight">{category.name}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
                    {t("categories.modelsCount", { count })}
                  </div>
                </div>
              </Link>
            );
          })}
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
