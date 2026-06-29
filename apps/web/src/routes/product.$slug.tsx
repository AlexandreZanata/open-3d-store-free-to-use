import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Share2, ShoppingBag, Box } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";
import { ModelViewer } from "@/components/ModelViewer";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton, ProductDetailSkeleton } from "@/components/LoadingSkeletons";
import { productQueryKey, useProduct } from "@/hooks/useProduct";
import { useProducts } from "@/hooks/useProducts";
import { ApiError } from "@/lib/api/client";
import { fetchProductBySlug } from "@/lib/api/products";
import { resolveAssetUrl } from "@/lib/assets";
import { addToCart } from "@/lib/cart";
import { mobileOnly, pagePadding, shellMaxWidth } from "@/lib/layout";
import { RailTrack } from "@/components/Rail";
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
  const [fav, setFav] = useState(false);
  const [tab, setTab] = useState<"viewer" | "gallery">("viewer");
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
  const posterUrl = resolveAssetUrl(detail.thumbnailUrl);
  const modelUrl = detail.modelFileUrl ? resolveAssetUrl(detail.modelFileUrl) : null;

  function handleAddToCart() {
    addToCart(detail);
  }

  return (
    <AppShell showBack showSearch={false} title={detail.name}>
      <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start lg:px-8">
        <section className={`${pagePadding} pt-4 lg:px-0 lg:pt-6`}>
          {tab === "viewer" && modelUrl ? (
            <section aria-label={t("product.viewerLabel")}>
              <ModelViewer modelUrl={modelUrl} posterUrl={posterUrl} productName={detail.name} />
            </section>
          ) : (
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted ring-1 ring-hairline">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={detail.name}
                  width={800}
                  height={1000}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : null}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            {modelUrl && (
              <Tab active={tab === "viewer"} onClick={() => setTab("viewer")}>
                <Box className="size-3.5" /> {t("product.tabModel")}
              </Tab>
            )}
            {detail.imageUrls.length > 0 && (
              <Tab active={tab === "gallery"} onClick={() => setTab("gallery")}>
                {t("product.galleryCount", { count: detail.imageUrls.length })}
              </Tab>
            )}
          </div>
        </section>

        <div className="lg:sticky lg:top-20">
          <section className={`${pagePadding} mt-6 lg:mt-0 lg:px-0`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-balance lg:text-2xl">
                  {detail.name}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">{detail.shortDescription}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-semibold lg:text-2xl">{detail.basePriceDisplay}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t(`material.${detail.material}`)}
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-foreground/80 leading-relaxed lg:text-base">
              {detail.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {detail.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 h-7 inline-flex items-center rounded-full bg-muted text-[11px] text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          <section className={`${pagePadding} mt-6 lg:px-0`}>
            <div className="bg-surface ring-1 ring-hairline rounded-2xl divide-y divide-hairline shadow-soft overflow-hidden">
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
            </div>
          </section>

          <div className="fixed bottom-16 inset-x-0 z-30 border-t border-hairline bg-background/95 backdrop-blur-xl lg:static lg:mt-8 lg:border-t-0 lg:bg-transparent lg:backdrop-blur-none">
            <div className={`${shellMaxWidth} ${pagePadding} py-3 flex items-center gap-2 lg:px-0`}>
              <button
                onClick={() => setFav((v) => !v)}
                aria-label={t("product.favorite")}
                className="size-11 grid place-items-center rounded-full ring-1 ring-hairline bg-surface press"
              >
                <Heart
                  className={`size-5 transition-colors ${fav ? "fill-accent text-accent" : ""}`}
                />
              </button>
              <button
                aria-label={t("product.share")}
                className="size-11 grid place-items-center rounded-full ring-1 ring-hairline bg-surface press"
              >
                <Share2 className="size-5" />
              </button>
              <button
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

      {related.length > 0 && (
        <section className="mt-10 lg:px-8">
          <div className={`${pagePadding} lg:px-0 mb-3`}>
            <h2 className="text-base font-semibold tracking-tight lg:text-lg">
              {t("product.related")}
            </h2>
          </div>
          <RailTrack>
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
          </RailTrack>
        </section>
      )}

      <div className={mobileOnly}>
        <div className="h-14" />
      </div>
    </AppShell>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold press ring-1 ${
        active
          ? "bg-foreground text-background ring-foreground"
          : "bg-surface text-muted-foreground ring-hairline"
      }`}
    >
      {children}
    </button>
  );
}
