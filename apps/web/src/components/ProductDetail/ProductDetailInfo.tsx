import { useTranslation } from "react-i18next";

import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareProductButton } from "@/components/ShareProductButton";
import type { ProductDetail } from "@print3d/shared-types";

type ProductDetailInfoProps = {
  product: ProductDetail;
};

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  const { t } = useTranslation();

  return (
    <>
      <header className="space-y-4">
        <div className="space-y-3 lg:hidden">
          <ProductTitle name={product.name} className="text-2xl" />
          <p className="text-sm leading-snug text-muted-foreground">{product.shortDescription}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {product.basePriceDisplay}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t(`material.${product.material}`)}
          </p>
          <ProductSocialActions product={product} />
          <ProductDescription text={product.description} />
          <ProductTags tags={product.tags} />
        </div>

        <div className="hidden space-y-3 lg:block">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <ProductTitle name={product.name} className="text-3xl" />
              <p className="text-base text-muted-foreground">{product.shortDescription}</p>
            </div>
            <div className="shrink-0 pt-0.5 text-right">
              <p className="text-3xl font-semibold tabular-nums">{product.basePriceDisplay}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {t(`material.${product.material}`)}
              </p>
            </div>
          </div>
          <ProductDescription text={product.description} className="text-base" />
          <ProductTags tags={product.tags} />
        </div>
      </header>

      <section
        className="overflow-hidden rounded-2xl bg-surface shadow-soft ring-1 ring-hairline divide-y divide-hairline"
        aria-label={t("product.specsLabel")}
      >
        <Spec label={t("product.material")} value={t(`material.${product.material}`)} />
        <Spec
          label={t("product.printTime")}
          value={t("product.printTimeHours", { hours: product.printTimeHours })}
        />
        <Spec
          label={t("product.weight")}
          value={t("product.weightGrams", { grams: product.weightGrams })}
        />
        <Spec label={t("product.status")} value={t(`status.${product.status}`)} />
      </section>
    </>
  );
}

function ProductTitle({ name, className }: { name: string; className: string }) {
  return (
    <h1 className={`font-semibold tracking-tight text-balance ${className}`}>{name}</h1>
  );
}

function ProductDescription({ text, className = "text-sm" }: { text: string; className?: string }) {
  return <p className={`leading-relaxed text-foreground/85 ${className}`}>{text}</p>;
}

function ProductTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex h-7 items-center rounded-full bg-muted px-2.5 text-[11px] text-muted-foreground"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

function ProductSocialActions({ product }: { product: ProductDetail }) {
  return (
    <div className="flex items-center gap-2 pt-0.5" data-testid="product-social-actions">
      <FavoriteButton
        productId={product.id}
        className="size-11 shrink-0 bg-surface ring-1 ring-hairline"
        iconClassName="size-5"
      />
      <ShareProductButton
        product={{
          slug: product.slug,
          name: product.name,
          shortDescription: product.shortDescription,
        }}
      />
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3.5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}
