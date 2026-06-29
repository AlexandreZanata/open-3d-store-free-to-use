import { Box } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ModelViewer } from "@/components/ModelViewer";
import { ModelPartColors } from "@/components/ModelStudio/ModelPartColors";
import { buildGallerySlides } from "@/lib/gallerySlides";
import { resolveAssetUrl } from "@/lib/assets";
import type { ModelPart, ShopColor } from "@print3d/shared-types";

import { ProductImageCarousel } from "./ProductImageCarousel";

type ProductMediaPanelProps = {
  productName: string;
  thumbnailUrl: string;
  imageUrls: string[];
  modelFileUrl: string | null;
  modelParts?: ModelPart[];
  availableColors?: ShopColor[];
};

export function ProductMediaPanel({
  productName,
  thumbnailUrl,
  imageUrls,
  modelFileUrl,
  modelParts = [],
  availableColors = [],
}: ProductMediaPanelProps) {
  const { t } = useTranslation();
  const slides = buildGallerySlides(thumbnailUrl, imageUrls);
  const hasModel = Boolean(modelFileUrl);
  const hasGallery = slides.length > 0;
  const [tab, setTab] = useState<"viewer" | "gallery">(hasModel ? "viewer" : "gallery");
  const defaultColor = availableColors[0]?.hex ?? "#9ca3af";
  const initialColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const part of modelParts) {
      map[part.id] = defaultColor;
    }
    return map;
  }, [modelParts, defaultColor]);
  const [partColors, setPartColors] = useState(initialColors);

  useEffect(() => {
    setPartColors(initialColors);
  }, [initialColors]);

  const posterUrl = resolveAssetUrl(thumbnailUrl);
  const modelUrl = modelFileUrl ? resolveAssetUrl(modelFileUrl) : null;
  const showColorPicker = hasModel && modelParts.length > 0 && availableColors.length > 0;

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-20">
      <div className="w-full lg:max-w-[min(100%,640px)]">
        {tab === "viewer" && modelUrl ? (
          <ModelViewer
            modelUrl={modelUrl}
            posterUrl={posterUrl}
            productName={productName}
            modelParts={modelParts}
            partColors={partColors}
          />
        ) : (
          <ProductImageCarousel
            thumbnailUrl={thumbnailUrl}
            imageUrls={imageUrls}
            productName={productName}
          />
        )}
      </div>

      {showColorPicker ? (
        <ModelPartColors
          parts={modelParts}
          colors={availableColors}
          value={partColors}
          onChange={setPartColors}
        />
      ) : null}

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
