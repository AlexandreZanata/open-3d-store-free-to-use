import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareProductButton } from "@/components/ShareProductButton";
import type { ProductDetail } from "@print3d/shared-types";

type ProductDetailActionsProps = {
  product: ProductDetail;
  onAddToCart: () => void;
};

export function ProductDetailActions({ product, onAddToCart }: ProductDetailActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-x-0 bottom-[3.75rem] z-40 border-t border-hairline bg-background/95 backdrop-blur-xl lg:static lg:border-t-0 lg:bg-transparent lg:backdrop-blur-none">
      <div className="flex items-center gap-2 px-4 py-3 lg:gap-3 lg:px-0 lg:py-0">
        <div className="hidden items-center gap-2 lg:flex lg:gap-3">
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
        <button
          type="button"
          onClick={onAddToCart}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-hairline bg-surface text-sm font-semibold press"
        >
          <ShoppingBag className="size-4" />
          {t("product.addToCart")}
        </button>
        <Link
          to="/cart"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background press hover:bg-foreground/90"
        >
          {t("product.orderWhatsApp")}
        </Link>
      </div>
    </div>
  );
}
