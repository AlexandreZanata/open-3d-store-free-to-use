import { useLayoutEffect, useRef, useState } from "react";

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

function isImgDecoded(img: HTMLImageElement | null): boolean {
  return Boolean(img?.complete && img.naturalWidth > 0);
}

/** Product/category thumbnail — avoids blank tiles when returning to cached catalog views. */
export function CatalogThumbnail({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: CatalogThumbnailProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (!src) {
      return;
    }
    const img = imgRef.current;
    if (isImgDecoded(img)) {
      markCatalogThumbnailWarm(src);
      setLoaded(true);
    }
  }, [src]);

  if (!src) {
    return null;
  }

  return (
    <img
      ref={imgRef}
      data-testid="catalog-thumbnail"
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={loaded ? "sync" : "async"}
      className={cn(
        "absolute inset-0 size-full object-cover",
        loaded ? "opacity-100" : "opacity-0",
        !loaded && "transition-opacity duration-150",
        className,
      )}
      onLoad={() => {
        markCatalogThumbnailWarm(src);
        setLoaded(true);
      }}
    />
  );
}
