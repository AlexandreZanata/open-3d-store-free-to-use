import { Link } from "@tanstack/react-router";
import { Heart, Star, Download } from "lucide-react";
import { useState } from "react";
import { formatCount, formatPrice, type Product } from "@/lib/products";

export function ProductCard({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "wide";
}) {
  const [fav, setFav] = useState(false);
  const width = variant === "wide" ? "w-[78vw] max-w-[300px]" : "w-full";

  return (
    <article className={`${width} shrink-0 group`}>
      <div className="relative bg-surface ring-1 ring-hairline rounded-2xl overflow-hidden shadow-soft lift">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="block relative aspect-[4/5] bg-muted"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1000}
            className="absolute inset-0 size-full object-cover"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-background/90 backdrop-blur text-foreground">
              {product.badge}
            </span>
          )}
          <span className="absolute bottom-3 left-3 px-2 py-1 rounded-md text-[10px] font-mono font-medium bg-background/90 backdrop-blur text-muted-foreground">
            {product.formats.slice(0, 2).join(" · ")}
          </span>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            setFav((v) => !v);
          }}
          aria-label="Favorite"
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
            <span className="text-sm font-semibold shrink-0">{formatPrice(product.price)}</span>
          </div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider truncate">
            {product.category}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="size-3 fill-foreground text-foreground" />
                <span className="text-foreground font-medium">{product.rating.toFixed(1)}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Download className="size-3" />
                {formatCount(product.downloads)}
              </span>
            </div>
            <Link
              to="/product/$id"
              params={{ id: product.id }}
              className="text-[11px] font-semibold uppercase tracking-wider text-foreground hover:text-accent transition-colors"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
