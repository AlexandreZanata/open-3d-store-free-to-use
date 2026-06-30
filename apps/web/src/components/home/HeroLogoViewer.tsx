import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { HERO_LOGO_MODEL_URL, preloadHeroLogo } from "@/lib/heroLogo";

import type { HeroLogoHandle } from "./heroLogoScene";

type HeroLogoViewerProps = {
  /** Compact tile for the mobile hero card. */
  compact?: boolean;
};

export function HeroLogoViewer({ compact = false }: HeroLogoViewerProps) {
  const { t } = useTranslation();
  const shellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HeroLogoHandle | null>(null);

  useEffect(() => {
    void preloadHeroLogo();
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    const container = containerRef.current;
    if (!shell || !container) {
      return;
    }

    let cancelled = false;

    const disposeViewer = () => {
      viewerRef.current?.dispose();
      viewerRef.current = null;
    };

    const mountViewer = () => {
      if (cancelled || viewerRef.current) {
        return;
      }

      void import("./heroLogoScene")
        .then(({ mountHeroLogoViewer }) => {
          if (cancelled || viewerRef.current) {
            return;
          }
          viewerRef.current = mountHeroLogoViewer(container, {
            modelUrl: HERO_LOGO_MODEL_URL,
            skipProbe: true,
          });
        })
        .catch(() => {
          disposeViewer();
        });
    };

    mountViewer();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible && shell.clientWidth > 0) {
          if (viewerRef.current) {
            viewerRef.current.resume();
          } else {
            mountViewer();
          }
        } else {
          viewerRef.current?.pause();
        }
      },
      { threshold: 0, rootMargin: "64px 0px" },
    );
    observer.observe(shell);

    return () => {
      cancelled = true;
      observer.disconnect();
      disposeViewer();
    };
  }, [compact]);

  const shellClass = compact
    ? "relative size-full bg-background"
    : "relative aspect-square w-full max-w-[17.5rem] bg-background";

  return (
    <div ref={shellRef} className={shellClass}>
      <div
        ref={containerRef}
        className="absolute inset-0"
        role="img"
        aria-label={t("home.heroLogoLabel")}
      />
    </div>
  );
}
