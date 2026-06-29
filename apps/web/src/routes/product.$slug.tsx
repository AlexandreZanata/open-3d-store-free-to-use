import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ShoppingBag, Share2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton, ProductDetailSkeleton } from "@/components/LoadingSkeletons";
import { ProductMediaPanel } from "@/components/ProductMedia";
import { productQueryKey, useProduct } from "@/hooks/useProduct";
import { useProducts } from "@/hooks/useProducts";
import { ApiError } from "@/lib/api/client";
import { fetchProductBySlug } from "@/lib/api/products";
import { addToCart } from "@/lib/cart";
import { mobileOnly, pagePadding, productGridCols } from "@/lib/layout";
import { getCurrentI18nLocale, default as i18n } from "@/i18n";
import { brandPageTitle } from "@/lib/brand";
import type { ProductDetail } from "@print3d/shared-types";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }): Promise<ProductDetail> => {
    const locale = getCurrentI18nLocale();
    try {
      return await context.queryClient.ensureQueryData({
        queryKey: productQueryKey(params.slug, locale),
        queryFn: () => fetchProductBySlug(params.slug, locale),
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw notFound();
      }
      throw error;
    }
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: brandPageTitle(loaderData.name) },
            { name: "description", content: loaderData.shortDescription },
            { property: "og:title", content: brandPageTitle(loaderData.name) },
            { property: "og:description", content: loaderData.shortDescription },
          ],
        }
      : { meta: [{ title: i18n.t("product.metaFallback") }] },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
  pendingComponent: ProductPending,
  errorComponent: ProductError,
});

function ProductNotFound() {
  const { t } = useTranslation();
  return (
    <AppShell title={t("product.notFoundMeta")} showBack showSearch={false}>
      <div className="px-6 py-24 text-center">
        <h3 className="text-base font-semibold">{t("product.notFoundTitle")}</h3>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 px-4 items-center rounded-full bg-foreground text-background text-sm font-semibold press"
        >
          {t("nav.backHome")}
        </Link>
      </div>
    </AppShell>
  );
}

function ProductPending() {
  return (
    <AppShell showBack showSearch={false}>
      <ProductDetailSkeleton />
    </AppShell>
  );
}

function ProductError({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation();
  const detail = error instanceof ApiError ? error.problem.detail : t("product.errorHint");

  return (
    <AppShell showBack showSearch={false} title={t("product.errorTitle")}>
      <div className="px-6 py-24 text-center">
        <h3 className="text-base font-semibold">{t("product.errorTitle")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        <button
          onClick={reset}
          className="mt-6 inline-flex h-10 px-4 items-center rounded-full bg-foreground text-background text-sm font-semibold press"
        >
          {t("common.retry")}
        </button>
      </div>
    </AppShell>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const productQuery = useProduct(slug);
  const product = productQuery.data;
  const { t } = useTranslation();
  const relatedQuery = useProducts({ limit: 20, page: 1 });
  const related =
    product && relatedQuery.data?.data
      ? relatedQuery.data.data
          .filter((item) => item.categoryId === product.categoryId && item.slug !== product.slug)
          .slice(0, 4)
      : [];

  if (!product) {
    return (
      <AppShell showBack showSearch={false}>
        <ProductDetailSkeleton />
      </AppShell>
    );
  }

  const detail = product;

  function handleAddToCart() {
    addToCart(detail);
  }

  return (
    <AppShell showBack showSearch={false} title={detail.name}>
      <div className={`${pagePadding} lg:pt-4`}>
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-8 lg:items-start">
          <section className="pt-2 lg:pt-0">
            <ProductMediaPanel
              productName={detail.name}
              thumbnailUrl={detail.thumbnailUrl}
              imageUrls={detail.imageUrls}
              modelFileUrl={detail.modelFileUrl}
            />
          </section>

          <div className="mt-8 lg:mt-0 flex flex-col gap-6">
            <header className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-balance lg:text-3xl">
                    {detail.name}
                  </h1>
                  <p className="text-sm text-muted-foreground lg:text-base">
                    {detail.shortDescription}
                  </p>
                </div>
                <div className="text-right shrink-0 pt-0.5">
                  <div className="text-2xl font-semibold tabular-nums lg:text-3xl">
                    {detail.basePriceDisplay}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                    {t(`material.${detail.material}`)}
                  </div>
                </div>
              </div>

              <p className="text-sm text-foreground/85 leading-relaxed lg:text-base">
                {detail.description}
              </p>

              {detail.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {detail.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 h-7 inline-flex items-center rounded-full bg-muted text-[11px] text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </header>

            <section
              className="bg-surface ring-1 ring-hairline rounded-2xl divide-y divide-hairline shadow-soft overflow-hidden"
              aria-label={t("product.specsLabel")}
            >
              <Spec label={t("product.material")} value={t(`material.${detail.material}`)} />
              <Spec
                label={t("product.printTime")}
                value={t("product.printTimeHours", { hours: detail.printTimeHours })}
              />
              <Spec
                label={t("product.weight")}
                value={t("product.weightGrams", { grams: detail.weightGrams })}
              />
              <Spec label={t("product.status")} value={t(`status.${detail.status}`)} />
            </section>

            <div className="fixed bottom-16 inset-x-0 z-30 border-t border-hairline bg-background/95 backdrop-blur-xl lg:static lg:border-t-0 lg:bg-transparent lg:backdrop-blur-none">
              <div className="flex items-center gap-2 lg:gap-3">
                <FavoriteButton
                  productId={detail.id}
                  className="size-11 shrink-0 ring-1 ring-hairline bg-surface"
                  iconClassName="size-5"
                />
                <button
                  type="button"
                  aria-label={t("product.share")}
                  className="size-11 shrink-0 grid place-items-center rounded-full ring-1 ring-hairline bg-surface press"
                >
                  <Share2 className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 h-11 rounded-full border border-hairline bg-surface inline-flex items-center justify-center gap-2 text-sm font-semibold press"
                >
                  <ShoppingBag className="size-4" />
                  {t("product.addToCart")}
                </button>
                <Link
                  to="/cart"
                  className="flex-1 h-11 rounded-full bg-foreground text-background inline-flex items-center justify-center gap-2 text-sm font-semibold press hover:bg-foreground/90"
                >
                  {t("product.orderWhatsApp")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className={`${pagePadding} mt-12 lg:mt-16`}>
          <h2 className="text-base font-semibold tracking-tight lg:text-lg mb-4">
            {t("product.related")}
          </h2>
          <div className="overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:overflow-visible lg:snap-none lg:px-0">
            <div
              className={`flex gap-3 w-max min-w-full lg:grid ${productGridCols} lg:w-full lg:gap-4`}
            >
              {relatedQuery.isLoading
                ? Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="snap-start">
                      <ProductCardSkeleton variant="wide" />
                    </div>
                  ))
                : related.map((item) => (
                    <div key={item.id} className="snap-start">
                      <ProductCard product={item} variant="wide" />
                    </div>
                  ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className={mobileOnly}>
        <div className="h-14" />
      </div>
    </AppShell>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
