import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { buildGallerySlides } from "@/lib/gallerySlides";
import { resolveAssetUrl } from "@/lib/assets";
import { cn } from "@/lib/utils";

type ProductImageCarouselProps = {
  thumbnailUrl: string;
  imageUrls: string[];
  productName: string;
};

export function ProductImageCarousel({
  thumbnailUrl,
  imageUrls,
  productName,
}: ProductImageCarouselProps) {
  const { t } = useTranslation();
  const slides = buildGallerySlides(thumbnailUrl, imageUrls);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const scroll = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev") {
        api?.scrollPrev();
      } else {
        api?.scrollNext();
      }
    },
    [api],
  );

  if (slides.length === 0) {
    return (
      <div
        className="aspect-square w-full rounded-2xl bg-muted ring-1 ring-hairline"
        aria-label={t("product.galleryEmpty")}
      />
    );
  }

  return (
    <div className="relative group">
      <Carousel setApi={setApi} className="w-full" opts={{ loop: slides.length > 1 }}>
        <CarouselContent className="ml-0">
          {slides.map((url, index) => (
            <CarouselItem key={`${url}-${index}`} className="pl-0 basis-full">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted ring-1 ring-hairline shadow-soft">
                <img
                  src={resolveAssetUrl(url)}
                  alt={t("product.gallerySlideAlt", { name: productName, index: index + 1 })}
                  width={800}
                  height={800}
                  className="absolute inset-0 size-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {slides.length > 1 ? (
        <>
          <CarouselOverlayButton
            direction="prev"
            label={t("product.galleryPrev")}
            onClick={() => scroll("prev")}
          />
          <CarouselOverlayButton
            direction="next"
            label={t("product.galleryNext")}
            onClick={() => scroll("next")}
          />
          <div
            className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none"
            aria-hidden
          >
            {slides.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "size-1.5 rounded-full transition-colors shadow-sm",
                  index === current ? "bg-white" : "bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CarouselOverlayButton({
  direction,
  label,
  onClick,
}: {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 size-9 grid place-items-center rounded-full",
        "bg-black/45 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100",
        "focus-visible:opacity-100 transition-opacity press",
        direction === "prev" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
