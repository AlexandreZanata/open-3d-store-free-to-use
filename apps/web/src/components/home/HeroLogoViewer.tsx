import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { HeroLogoPlaceholder } from "@/components/home/HeroLogoPlaceholder";
import { preloadHeroLogo } from "@/lib/heroLogo";
import {
  attachHeroLogoSlot,
  isHeroLogoReady,
  subscribeHeroLogoReady,
} from "@/lib/heroLogoViewerHost";

type HeroLogoViewerProps = {
  /** Compact tile for the mobile hero card. */
  compact?: boolean;
};

export function HeroLogoViewer({ compact = false }: HeroLogoViewerProps) {
  const { t } = useTranslation();
  const shellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(isHeroLogoReady);
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    void preloadHeroLogo();
  }, []);

  useEffect(() => subscribeHeroLogoReady(setReady), []);

  useEffect(() => {
    const shell = shellRef.current;
    const container = containerRef.current;
    if (!shell || !container) {
      return;
    }

    const syncAspect = () => {
      const height = Math.max(shell.clientHeight, 1);
      setAspect(shell.clientWidth / height);
    };

    syncAspect();
    const sizeObserver = new ResizeObserver(syncAspect);
    sizeObserver.observe(shell);

    const detachSlot = attachHeroLogoSlot(shell, container);

    return () => {
      sizeObserver.disconnect();
      detachSlot();
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
