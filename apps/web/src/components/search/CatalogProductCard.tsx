import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { ProductListItem } from "@print3d/shared-types";

import { FavoriteButton } from "@/components/FavoriteButton";
import { productCardImageAspect } from "@/lib/layout";
import { resolveAssetUrl } from "@/lib/assets";

/** Desktop catalog card — roomier layout for search and category grids. */
export function CatalogProductCard({ product }: { product: ProductListItem }) {
  const { t } = useTranslation();
  const imageUrl = resolveAssetUrl(product.thumbnailUrl);

  return (
    <article className="group h-full">
      <div className="relative flex h-full flex-col bg-surface ring-1 ring-hairline rounded-2xl overflow-hidden shadow-soft lift">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className={`block relative ${productCardImageAspect} bg-muted overflow-hidden`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              width={800}
              height={800}
              className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
          {product.hasModel && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-background/90 backdrop-blur text-foreground">
              3D
            </span>
          )}
        </Link>
        <FavoriteButton productId={product.id} className="absolute top-3 right-3 z-10" />

        <div className="flex flex-1 flex-col p-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {product.material}
          </span>
          <h3 className="mt-2 text-base font-semibold tracking-tight leading-snug line-clamp-2 min-h-[2.75rem]">
            {product.name}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
            {product.shortDescription}
          </p>
          <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-hairline">
            <span className="text-lg font-semibold tracking-tight">{product.basePriceDisplay}</span>
            <Link
              to="/product/$slug"
              params={{ slug: product.slug }}
              className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-xs font-semibold uppercase tracking-wider text-background press hover:bg-foreground/90"
            >
              {t("common.view")}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
