import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { CategoryResponse } from "@print3d/shared-types";

import { resolveAssetUrl } from "@/lib/assets";
import { cn } from "@/lib/utils";

type CategoryCardProps = {
  category: Pick<CategoryResponse, "slug" | "name" | "imageUrl">;
  productCount?: number;
  className?: string;
};

export function CategoryCard({ category, productCount, className }: CategoryCardProps) {
  const { t } = useTranslation();
  const imageUrl = resolveAssetUrl(category.imageUrl);

  return (
    <Link
      to="/search"
      search={{ category: category.slug }}
      className={cn(
        "group relative block aspect-square overflow-hidden rounded-2xl bg-muted ring-1 ring-hairline shadow-soft lift",
        className,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          width={480}
          height={480}
          className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-surface to-muted" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-foreground/10 to-transparent" />

      <div className="absolute inset-x-3 bottom-3 z-10">
        <div className="rounded-xl bg-background/92 px-3.5 py-3 shadow-soft ring-1 ring-hairline backdrop-blur-md">
          <p className="text-sm font-semibold tracking-tight text-foreground">{category.name}</p>
          {productCount !== undefined && (
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("categories.modelsCount", { count: productCount })}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
