import { cn } from "@/lib/utils";

const ICON_SRC = "/brand/corvo-icon.png";

const BRAND_MARK_SIZES = {
  sm: "h-8 w-[2.875rem]",
  md: "h-9 w-[3.25rem]",
  lg: "h-12 w-[4.375rem]",
} as const;

type BrandMarkSize = keyof typeof BRAND_MARK_SIZES;

type BrandMarkProps = {
  size?: BrandMarkSize;
  className?: string;
};

export function BrandMark({ size = "md", className }: BrandMarkProps) {
  return (
    <img
      src={ICON_SRC}
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
