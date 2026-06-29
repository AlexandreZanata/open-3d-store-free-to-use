import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProductListItem } from "@print3d/shared-types";

import { AppShell } from "@/components/AppShell";
import { ProductGridSkeleton } from "@/components/LoadingSkeletons";
import { ProductCard } from "@/components/ProductCard";
import { useFavorites } from "@/hooks/useFavorites";
import { default as i18n } from "@/i18n";
import { brandPageTitle } from "@/lib/brand";
import { desktopOnly, mobileOnly, pagePadding, productGridCols } from "@/lib/layout";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [{ title: brandPageTitle(i18n.t("favorites.title")) }],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { t } = useTranslation();
  const favoritesQuery = useFavorites();
  const favorites = favoritesQuery.favorites;
  const cachedCount = favoritesQuery.data?.meta.count ?? 0;
  const isHydratingList =
    favoritesQuery.isFetching && favorites.length === 0 && cachedCount > 0;

  return (
    <AppShell showSearch={false} title={t("favorites.title")}>
      {isHydratingList ? (
        <ProductGridSkeleton count={Math.min(cachedCount, 4)} />
      ) : favorites.length === 0 ? (
        <EmptyState loading={favoritesQuery.isFetching} />
      ) : (
        <div className={`${pagePadding} py-4 lg:py-8`}>
          <div className={`${mobileOnly} mb-4`}>
            <p className="text-sm text-muted-foreground">
              {t("favorites.count", { count: favorites.length })}
            </p>
          </div>
          <div className={`${desktopOnly} mb-6 flex items-end justify-between`}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t("nav.favorites")}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{t("favorites.title")}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("favorites.count", { count: favorites.length })}
            </p>
          </div>
          <div className={productGridCols}>
            {favorites.map((product: ProductListItem) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  return (
    <div className={`${pagePadding} py-24 text-center`}>
      <div className="mx-auto size-14 rounded-full bg-muted grid place-items-center mb-4">
        {loading ? (
          <Loader2 className="size-6 text-muted-foreground animate-spin" aria-hidden />
        ) : (
          <Heart className="size-6 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-base font-semibold">{t("favorites.emptyTitle")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("favorites.emptyHint")}</p>
      <Link
        to="/"
        className="mt-6 inline-flex h-10 px-4 items-center rounded-full bg-foreground text-background text-sm font-semibold press"
      >
        {t("favorites.browse")}
      </Link>
    </div>
  );
}
