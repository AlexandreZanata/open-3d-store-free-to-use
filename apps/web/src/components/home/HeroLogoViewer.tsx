import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { HeroLogoPlaceholder } from "@/components/home/HeroLogoPlaceholder";
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
  const [ready, setReady] = useState(false);
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    void preloadHeroLogo();
  }, []);

  useEffect(() => {
    setReady(false);
  }, [compact]);

  useEffect(() => {
    const shell = shellRef.current;
    const container = containerRef.current;
    if (!shell || !container) {
      return;
    }

    let cancelled = false;

    const syncAspect = () => {
      const height = Math.max(shell.clientHeight, 1);
      setAspect(shell.clientWidth / height);
    };

    const disposeViewer = () => {
      viewerRef.current?.dispose();
      viewerRef.current = null;
    };

    const mountViewer = () => {
      if (cancelled || viewerRef.current) {
        return;
      }
      if (container.clientWidth === 0 || container.clientHeight === 0) {
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
            onReady: () => {
              if (!cancelled) {
                setReady(true);
              }
            },
          });
        })
        .catch(() => {
          disposeViewer();
        });
    };

    syncAspect();
    mountViewer();

    const sizeObserver = new ResizeObserver(() => {
      syncAspect();
      if (!cancelled && !viewerRef.current) {
        mountViewer();
      }
    });
    sizeObserver.observe(shell);
    sizeObserver.observe(container);

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
      sizeObserver.disconnect();
      observer.disconnect();
      disposeViewer();
    };
  }, [compact]);

  const shellClass = compact
    ? "relative size-full bg-background"
    : "relative aspect-square w-full max-w-[17.5rem] bg-background";

  return (
    <div ref={shellRef} className={shellClass}>
      {!ready ? <HeroLogoPlaceholder aspect={aspect} /> : null}
      <div
        ref={containerRef}
        className="absolute inset-0 z-[2]"
        role="img"
        aria-label={t("home.heroLogoLabel")}
        aria-busy={!ready}
      />
    </div>
  );
}
