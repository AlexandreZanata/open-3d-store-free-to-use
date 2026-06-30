import { markCatalogThumbnailWarm } from "@/lib/catalogThumbnailCache";
import { cn } from "@/lib/utils";

type CatalogThumbnailProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
};

/** Product/category thumbnail — browser cache paints immediately; no opacity flash on return. */
export function CatalogThumbnail({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: CatalogThumbnailProps) {
  if (!src) {
    return null;
  }

  return (
    <img
      data-testid="catalog-thumbnail"
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("absolute inset-0 size-full object-cover", className)}
      onLoad={() => {
        markCatalogThumbnailWarm(src);
      }}
    />
  );
}
