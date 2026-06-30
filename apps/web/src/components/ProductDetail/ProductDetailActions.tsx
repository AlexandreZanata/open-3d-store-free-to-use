import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareProductButton } from "@/components/ShareProductButton";
import { useFooterInView } from "@/hooks/useFooterInView";
import { mobileStackAboveTabBar } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@print3d/shared-types";

type ProductDetailActionsProps = {
  product: ProductDetail;
  onAddToCart: () => void;
  onOrderWhatsApp: () => void;
  orderingWhatsApp?: boolean;
};

export function ProductDetailActions({
  product,
  onAddToCart,
  onOrderWhatsApp,
  orderingWhatsApp = false,
}: ProductDetailActionsProps) {
  const { t } = useTranslation();
  const footerInView = useFooterInView();

  return (
    <div
      data-testid="product-sticky-actions"
      className={cn(
        `fixed inset-x-0 ${mobileStackAboveTabBar} z-40 isolate border-t border-hairline bg-background transition-all duration-200 lg:static lg:border-t-0 lg:bg-transparent lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto`,
        footerInView && "pointer-events-none translate-y-full opacity-0",
      )}
    >
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
        <button
          type="button"
          onClick={onOrderWhatsApp}
          disabled={orderingWhatsApp}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-black press hover:bg-[#20bd5a] disabled:opacity-60"
        >
          {t("product.orderWhatsApp")}
        </button>
      </div>
    </div>
  );
}
