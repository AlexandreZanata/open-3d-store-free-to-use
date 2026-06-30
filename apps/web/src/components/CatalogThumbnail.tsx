import { useEffect, useRef, useState } from "react";

import {
  isCatalogThumbnailWarm,
  markCatalogThumbnailWarm,
} from "@/lib/catalogThumbnailCache";
import { cn } from "@/lib/utils";

type CatalogThumbnailProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
};

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
  const [loaded, setLoaded] = useState(() => isCatalogThumbnailWarm(src));

  useEffect(() => {
    if (!src) {
      return;
    }
    if (isCatalogThumbnailWarm(src)) {
      setLoaded(true);
      return;
    }
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
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
