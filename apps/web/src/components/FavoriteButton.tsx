import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  productId: string;
  className?: string;
  iconClassName?: string;
};

export function FavoriteButton({ productId, className, iconClassName }: FavoriteButtonProps) {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite, isTogglingProductId } = useFavorites();
  const favorited = isFavorite(productId);
  const isToggling = isTogglingProductId === productId;

  return (
    <button
      type="button"
      disabled={isToggling}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggleFavorite(productId);
      }}
      aria-label={t("product.favorite")}
      aria-pressed={favorited}
      className={cn(
        "relative z-10 size-9 grid place-items-center rounded-full bg-background/90 backdrop-blur shadow-soft press disabled:opacity-60",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          favorited ? "fill-accent text-accent" : "text-foreground",
          iconClassName,
        )}
      />
    </button>
  );
}
