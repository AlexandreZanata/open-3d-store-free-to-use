import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import type { TFunction } from "i18next";
import type { CategoryResponse, ProductListItem } from "@print3d/shared-types";

import { CategoryCard } from "@/components/CategoryCard";
import { HeroLogoViewer } from "@/components/home/HeroLogoViewer";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/LoadingSkeletons";
import { categoryGridCols, desktopHeroSurface, productGridCols } from "@/lib/layout";

type Props = {
  products: ProductListItem[];
  categories: CategoryResponse[];
  isLoading: boolean;
  t: TFunction;
};

export function HomeDesktopView({ products, categories, isLoading, t }: Props) {
  const featured = products.slice(0, 6);
  const catalog = products;

  return (
    <div className="px-8 py-8 space-y-14">
      <section className={desktopHeroSurface}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,oklch(0.68_0.18_45/0.25),transparent_50%)]" />
        <div className="relative grid xl:grid-cols-[1.1fr_0.9fr] min-h-[300px]">
          <div className="p-10 xl:p-12 flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-background/55">
              <Sparkles className="size-3.5" />
              {t("home.featuredLabel")}
            </span>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance max-w-xl leading-[1.1]">
              {t("home.featuredTitle")}
            </h2>
            <p className="mt-4 text-sm text-background/70 max-w-md leading-relaxed">
              {t("desktop.heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-background text-foreground text-sm font-semibold press"
              >
                {t("home.featuredCta")}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center h-11 px-6 rounded-full ring-1 ring-background/25 text-sm font-semibold text-background press hover:bg-background/10"
              >
                {t("desktop.shopByCategory")}
              </Link>
            </div>
          </div>
          <div className="hidden xl:grid place-items-center p-10">
            <div className="relative grid place-items-center rounded-3xl bg-background p-5 shadow-soft ring-1 ring-background/20 min-h-[17.5rem] min-w-[17.5rem]">
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_42%,oklch(0.68_0.18_45/0.14),transparent_68%)]"
                aria-hidden
              />
              <HeroLogoViewer />
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t("desktop.shopByCategory")}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{t("home.categoriesTitle")}</h2>
            </div>
            <Link
              to="/categories"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              {t("home.viewAll")}
            </Link>
          </div>
          <div className={categoryGridCols}>
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </section>
      )}

      <ProductSection
        title={t("home.featuredProducts")}
        actionLabel={t("home.railAll")}
        isLoading={isLoading}
        products={featured}
      />

      <ProductSection
        title={t("home.allProducts")}
        actionLabel={t("home.railAll")}
        isLoading={isLoading}
        products={catalog}
      />
    </div>
  );
}

function ProductSection({
  title,
  actionLabel,
  isLoading,
  products,
}: {
  title: string;
  actionLabel: string;
  isLoading: boolean;
  products: ProductListItem[];
}) {
  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <Link
          to="/search"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          {actionLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className={productGridCols}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} variant="default" />
            ))
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
