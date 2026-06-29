import { Box } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ModelViewer } from "@/components/ModelViewer";
import { buildGallerySlides } from "@/lib/gallerySlides";
import { resolveAssetUrl } from "@/lib/assets";

import { ProductImageCarousel } from "./ProductImageCarousel";

type ProductMediaPanelProps = {
  productName: string;
  thumbnailUrl: string;
  imageUrls: string[];
  modelFileUrl: string | null;
};

export function ProductMediaPanel({
  productName,
  thumbnailUrl,
  imageUrls,
  modelFileUrl,
}: ProductMediaPanelProps) {
  const { t } = useTranslation();
  const slides = buildGallerySlides(thumbnailUrl, imageUrls);
  const hasModel = Boolean(modelFileUrl);
  const hasGallery = slides.length > 0;
  const [tab, setTab] = useState<"viewer" | "gallery">(hasModel ? "viewer" : "gallery");

  const posterUrl = resolveAssetUrl(thumbnailUrl);
  const modelUrl = modelFileUrl ? resolveAssetUrl(modelFileUrl) : null;

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-20">
      <div className="w-full lg:max-w-[min(100%,640px)]">
        {tab === "viewer" && modelUrl ? (
          <ModelViewer modelUrl={modelUrl} posterUrl={posterUrl} productName={productName} />
        ) : (
          <ProductImageCarousel
            thumbnailUrl={thumbnailUrl}
            imageUrls={imageUrls}
            productName={productName}
          />
        )}
      </div>

      {hasModel || hasGallery ? (
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start" role="tablist">
          {hasModel ? (
            <MediaTab active={tab === "viewer"} onClick={() => setTab("viewer")}>
              <Box className="size-3.5" aria-hidden />
              {t("product.tabModel")}
            </MediaTab>
          ) : null}
          {hasGallery ? (
            <MediaTab active={tab === "gallery"} onClick={() => setTab("gallery")}>
              {t("product.galleryCount", { count: slides.length })}
            </MediaTab>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MediaTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold press ring-1 transition-colors ${
        active
          ? "bg-foreground text-background ring-foreground"
          : "bg-surface text-muted-foreground ring-hairline hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
