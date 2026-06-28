import { Skeleton } from "@/components/ui/skeleton";
import { productCardWideWidth, productGridCols } from "@/lib/layout";

export function ProductCardSkeleton({ variant = "default" }: { variant?: "default" | "wide" }) {
  const width = variant === "wide" ? productCardWideWidth : "w-full";
  return (
    <div className={`${width} shrink-0`}>
      <div className="rounded-2xl overflow-hidden ring-1 ring-hairline">
        <Skeleton className="aspect-[4/5] w-full rounded-none" />
        <div className="p-3.5 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`px-4 lg:px-8 ${productGridCols}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="px-4 pt-4 space-y-6">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
