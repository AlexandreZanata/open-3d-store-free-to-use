import { BRAND_MARK_ICON_SRC, BRAND_MARK_SIZES } from "@/lib/brandMark";
import { cn } from "@/lib/utils";

type BrandMarkSize = keyof typeof BRAND_MARK_SIZES;

type BrandMarkProps = {
  size?: BrandMarkSize;
  className?: string;
};

export function BrandMark({ size = "md", className }: BrandMarkProps) {
  return (
    <img
      src={BRAND_MARK_ICON_SRC}
      alt=""
      aria-hidden
      className={cn(
        "block shrink-0 object-contain object-center",
        BRAND_MARK_SIZES[size],
        className,
      )}
    />
  );
}
