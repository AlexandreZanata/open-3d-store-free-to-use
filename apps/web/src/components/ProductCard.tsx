import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProductListItem } from "@print3d/shared-types";

import { resolveAssetUrl } from "@/lib/assets";
import { productCardWideWidth } from "@/lib/layout";

export function ProductCard({
  product,
  variant = "default",
}: {
  product: ProductListItem;
  variant?: "default" | "wide";
}) {
  const { t } = useTranslation();
  const [fav, setFav] = useState(false);
  const width = variant === "wide" ? productCardWideWidth : "w-full";
  const imageUrl = resolveAssetUrl(product.thumbnailUrl);

  return (
    <article className={`${width} shrink-0 group`}>
      <div className="relative bg-surface ring-1 ring-hairline rounded-2xl overflow-hidden shadow-soft lift">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="block relative aspect-[4/5] bg-muted"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              width={800}
              height={1000}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
          {product.hasModel && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-background/90 backdrop-blur text-foreground">
              3D
            </span>
          )}
          <span className="absolute bottom-3 left-3 px-2 py-1 rounded-md text-[10px] font-mono font-medium bg-background/90 backdrop-blur text-muted-foreground">
            {product.material}
          </span>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            setFav((v) => !v);
          }}
          aria-label={t("product.favorite")}
          className="absolute top-2.5 right-2.5 size-9 grid place-items-center rounded-full bg-background/90 backdrop-blur shadow-soft press"
        >
          <Heart
            className={`size-4 transition-colors ${
              fav ? "fill-accent text-accent" : "text-foreground"
            }`}
          />
        </button>

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold tracking-tight truncate">{product.name}</h3>
            <span className="text-sm font-semibold shrink-0">{product.basePriceDisplay}</span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2">
            {product.shortDescription}
          </p>

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
