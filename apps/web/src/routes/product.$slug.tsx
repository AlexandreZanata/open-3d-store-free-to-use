import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailActions, ProductDetailInfo } from "@/components/ProductDetail";
import { ProductCardSkeleton, ProductDetailSkeleton } from "@/components/LoadingSkeletons";
import { ProductMediaPanel } from "@/components/ProductMedia";
import { productQueryKey, useProduct } from "@/hooks/useProduct";
import { useShopConfig } from "@/hooks/useShopConfig";
import { useProducts } from "@/hooks/useProducts";
import { ApiError } from "@/lib/api/client";
import { fetchProductBySlug } from "@/lib/api/products";
import { captureOrder } from "@/lib/api/orders";
import { addToCart } from "@/lib/cart";
import { mobileOnly, pagePadding, productGridCols, railScroll } from "@/lib/layout";
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
            { property: "og:type", content: "product" },
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
  const shopConfigQuery = useShopConfig();
  const product = productQuery.data;
  const { t } = useTranslation();
  const [orderingWhatsApp, setOrderingWhatsApp] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
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

  async function handleOrderWhatsApp() {
    if (orderingWhatsApp) {
      return;
    }
    setOrderingWhatsApp(true);
    setOrderError(null);
    try {
      const result = await captureOrder({
        items: [{ productId: detail.id, quantity: 1, selectedOptions: {} }],
      });
      window.location.href = result.whatsappLink;
    } catch {
      setOrderError(t("cart.orderError"));
      setOrderingWhatsApp(false);
    }
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
              modelParts={detail.modelParts}
              availableColors={shopConfigQuery.data?.availableColors ?? []}
            />
          </section>

          <div className="mt-8 lg:mt-0 flex flex-col gap-6">
            <ProductDetailInfo product={detail} />
            {orderError ? (
              <p className="text-sm text-destructive" role="alert">
                {orderError}
              </p>
            ) : null}
            <ProductDetailActions
              product={detail}
              onAddToCart={handleAddToCart}
              onOrderWhatsApp={handleOrderWhatsApp}
              orderingWhatsApp={orderingWhatsApp}
            />
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-12 lg:mt-16">
          <h2 className={`${pagePadding} text-base font-semibold tracking-tight lg:text-lg mb-4`}>
            {t("product.related")}
          </h2>
          <div className={`${railScroll} lg:overflow-visible lg:snap-none`}>
            <div className={`flex gap-3 px-4 w-max min-w-full lg:grid ${productGridCols} lg:w-full lg:gap-4 lg:px-8`}>
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
        <div className="h-[7.5rem]" aria-hidden />
      </div>
    </AppShell>
  );
}
