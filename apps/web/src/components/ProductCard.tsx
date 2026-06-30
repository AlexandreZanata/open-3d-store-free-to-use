import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { ProductListItem } from "@print3d/shared-types";

import { CatalogThumbnail } from "@/components/CatalogThumbnail";
import { FavoriteButton } from "@/components/FavoriteButton";
import { resolveAssetUrl } from "@/lib/assets";
import { productCardImageAspect, productCardWideWidth } from "@/lib/layout";
import {
  MaterialBadge,
  Model3DBadge,
  ProductCardDescription,
} from "@/components/ProductCardUi";

export function ProductCard({
  product,
  variant = "default",
  priority = false,
}: {
  product: ProductListItem;
  variant?: "default" | "wide";
  priority?: boolean;
}) {
  const { t } = useTranslation();
  const width = variant === "wide" ? productCardWideWidth : "w-full";
  const imageUrl = resolveAssetUrl(product.thumbnailUrl);

  return (
    <article className={`${width} shrink-0 group`}>
      <div className="relative bg-surface ring-1 ring-hairline rounded-2xl overflow-hidden shadow-soft lift">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className={`block relative ${productCardImageAspect} bg-muted`}
        >
          {imageUrl ? (
            <CatalogThumbnail
              src={imageUrl}
              alt={product.name}
              priority={priority}
              width={800}
              height={800}
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
          {product.hasModel ? <Model3DBadge className="absolute top-3 left-3" /> : null}
          <MaterialBadge
            material={product.material}
            label={t(`material.${product.material}`)}
            className="absolute bottom-3 left-3"
          />
        </Link>

        <FavoriteButton productId={product.id} className="absolute top-2.5 right-2.5" />

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold tracking-tight truncate">{product.name}</h3>
            <span className="text-sm font-semibold shrink-0">{product.basePriceDisplay}</span>
          </div>
          <ProductCardDescription text={product.shortDescription} />

          <div className="mt-3 flex items-center justify-end">
            <Link
              to="/product/$slug"
              params={{ slug: product.slug }}
              className="text-[11px] font-semibold uppercase tracking-wider text-foreground hover:text-accent transition-colors"
            >
              {t("common.view")}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
