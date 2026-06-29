import { cn } from "@/lib/utils";

type CartCountBadgeProps = {
  count: number;
  className?: string;
};

export function CartCountBadge({ count, className }: CartCountBadgeProps) {
  if (count <= 0) {
    return null;
  }

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute flex min-w-[1.125rem] h-[1.125rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-accent-foreground ring-2 ring-background",
        className,
      )}
    >
      {label}
    </span>
  );
}
