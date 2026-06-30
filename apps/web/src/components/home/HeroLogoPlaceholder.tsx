import { heroLogoPlaceholderDiameterRatio } from "@/components/home/heroLogoScene";
import { BRAND_MARK_FALLBACK_CLASS, BRAND_MARK_ICON_SRC } from "@/lib/brandMark";

type HeroLogoPlaceholderProps = {
  aspect: number;
};

/** Solid black corvo icon — same footprint as the fitted hero GLB until WebGL is ready. */
export function HeroLogoPlaceholder({ aspect }: HeroLogoPlaceholderProps) {
  const fitPercent = heroLogoPlaceholderDiameterRatio(aspect) * 100;

  return (
    <div
      className="absolute inset-0 z-[1] grid place-items-center pointer-events-none"
      aria-hidden
      data-testid="hero-logo-placeholder"
    >
      <img
        src={BRAND_MARK_ICON_SRC}
        alt=""
        className={`block shrink-0 object-contain object-center ${BRAND_MARK_FALLBACK_CLASS}`}
        style={{
          width: `${fitPercent}%`,
          maxHeight: `${fitPercent}%`,
        }}
      />
    </div>
  );
}
