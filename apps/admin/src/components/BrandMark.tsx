import { cn } from "@/lib/utils";

const ICON_SRC = "/brand/corvo-logo.png";

/** Shared mark sizes — keep web and admin BrandMark in sync */
const BRAND_MARK_SIZES = {
  sm: "h-9 w-[3.25rem]",
  md: "h-11 w-[4rem]",
  lg: "h-14 w-[5rem]",
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
