import type { MaterialType } from "@print3d/shared-types";

import { materialBadgeClass } from "@/lib/productCardUi";
import { cn } from "@/lib/utils";

type MaterialBadgeProps = {
  material: MaterialType;
  label?: string;
  className?: string;
};

export function MaterialBadge({ material, label, className }: MaterialBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 backdrop-blur",
        materialBadgeClass(material),
        className,
      )}
    >
      {label ?? material.replace(/_/g, " ")}
    </span>
  );
}

export function Model3DBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#25D366] text-black ring-1 ring-black/10",
        className,
      )}
    >
      3D
    </span>
  );
}

/** Fixed-height card blurb — never grows the product tile. */
export function ProductCardDescription({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] text-muted-foreground line-clamp-2 min-h-[2.5rem] max-h-[2.5rem] overflow-hidden",
        className,
      )}
      title={text}
    >
      {text}
    </p>
  );
}
