import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { BrandMark } from "@/components/BrandMark";
import { HERO_LOGO_MODEL_URL } from "@/lib/heroLogo";

import type { HeroLogoHandle } from "./heroLogoScene";

export function HeroLogoViewer() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HeroLogoHandle | null>(null);
  const [showFallback, setShowFallback] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    viewerRef.current?.dispose();
    viewerRef.current = null;
    setShowFallback(true);

    void import("./heroLogoScene")
      .then(({ mountHeroLogoViewer }) => {
        if (cancelled) {
          return;
        }
        const handle = mountHeroLogoViewer(container, {
          modelUrl: HERO_LOGO_MODEL_URL,
          onReady: () => {
            if (!cancelled) {
              setShowFallback(false);
            }
          },
          onError: () => {
            if (!cancelled) {
              setShowFallback(true);
            }
          },
        });
        viewerRef.current = handle;
      })
      .catch(() => {
        if (!cancelled) {
          setShowFallback(true);
        }
      });

    return () => {
      cancelled = true;
      viewerRef.current?.dispose();
      viewerRef.current = null;
    };
  }, []);

  return (
    <div className="relative aspect-square w-full max-w-[17.5rem]">
      {showFallback ? (
        <BrandMark
          className="absolute inset-0 m-auto h-28 w-28 object-contain opacity-90"
          aria-hidden
        />
      ) : null}
      <div
        ref={containerRef}
        className="absolute inset-0"
        role="img"
        aria-label={t("home.heroLogoLabel")}
      />
    </div>
  );
}
