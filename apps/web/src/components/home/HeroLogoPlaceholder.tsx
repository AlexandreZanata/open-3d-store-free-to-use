import {
  HERO_LOGO_COLOR_HEX,
  heroLogoPlaceholderDiameterRatio,
} from "@/components/home/heroLogoScene";

type HeroLogoPlaceholderProps = {
  aspect: number;
};

/** Black circle — same footprint as the fitted hero GLB until WebGL is ready. */
export function HeroLogoPlaceholder({ aspect }: HeroLogoPlaceholderProps) {
  const diameterPercent = heroLogoPlaceholderDiameterRatio(aspect) * 100;

  return (
    <div
      className="absolute inset-0 z-[1] grid place-items-center pointer-events-none"
      aria-hidden
      data-testid="hero-logo-placeholder"
    >
      <div
        className="aspect-square shrink-0 rounded-full"
        style={{
          backgroundColor: HERO_LOGO_COLOR_HEX,
          width: `${diameterPercent}%`,
        }}
      />
    </div>
  );
}
