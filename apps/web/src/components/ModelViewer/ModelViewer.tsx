import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ModelPart } from "@print3d/shared-types";

import type { ModelViewerHandle } from "./threeScene";

type ModelViewerProps = {
  modelUrl: string;
  posterUrl: string;
  productName: string;
  modelParts?: ModelPart[];
  partColors?: Record<string, string>;
};

export function ModelViewer({
  modelUrl,
  posterUrl,
  productName,
  modelParts = [],
  partColors = {},
}: ModelViewerProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ModelViewerHandle | null>(null);
  const [failed, setFailed] = useState(false);
  const [tooLarge, setTooLarge] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setTooLarge(false);
    setDimensions(null);
    viewerRef.current?.dispose();
    viewerRef.current = null;

    void import("./threeScene")
      .then(({ mountThreeModelViewer }) => {
        if (cancelled) {
          return;
        }
        const handle = mountThreeModelViewer(container, {
          modelUrl,
          modelParts,
          partColors,
          onReady: () => {
            if (!cancelled) {
              setLoading(false);
            }
          },
          onError: (reason) => {
            if (!cancelled) {
              if (reason === "too_large" || reason === "geometry_too_heavy") {
                setTooLarge(true);
              } else {
                setFailed(true);
              }
              setLoading(false);
            }
          },
          onDimensions: (text) => {
            if (!cancelled) {
              setDimensions(text);
            }
          },
        });
        viewerRef.current = handle;
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      viewerRef.current?.dispose();
      viewerRef.current = null;
    };
    // partColors applied in separate effect to avoid full scene remount
    // eslint-disable-next-line react-hooks/exhaustive-deps -- modelUrl/modelParts only
  }, [modelUrl, modelParts]);

  useEffect(() => {
    viewerRef.current?.updatePartColors(partColors);
  }, [partColors]);

  if (tooLarge) {
    return (
      <div className="relative aspect-square w-full rounded-2xl bg-muted ring-1 ring-hairline overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-90"
            aria-hidden
          />
        ) : null}
        <div className="absolute inset-0 grid place-items-center bg-background/70 px-6 text-center">
          <p className="text-sm text-muted-foreground">{t("product.viewerTooLarge")}</p>
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-muted ring-1 ring-hairline grid place-items-center text-sm text-muted-foreground px-6 text-center">
        {t("product.viewerUnavailable")}
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-hairline shadow-soft bg-muted">
      {loading && posterUrl ? (
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 size-full object-cover"
          aria-hidden
        />
      ) : null}
      {loading ? (
        <div className="absolute inset-0 bg-muted/50 animate-pulse" aria-hidden />
      ) : null}
      <div
        ref={containerRef}
        className="absolute inset-0 touch-pan-y"
        role="img"
        aria-label={t("product.viewerLabel", { name: productName })}
      />
      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/90 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {t("product.viewerScaleHint")}
        </span>
      </div>
      {dimensions ? (
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/90 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {dimensions}
          </span>
        </div>
      ) : null}
    </div>
  );
}
