import { cn } from "@/lib/utils";

const ICON_SRC = "/brand/corvo-icon.png";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <img
      src={ICON_SRC}
      alt=""
      aria-hidden
      className={cn("h-full w-auto object-contain", className)}
    />
  );
}
