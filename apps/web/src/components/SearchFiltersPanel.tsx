import type { ReactNode } from "react";
import type { ProductQueryParams } from "@/lib/api/types";

type CategoryOption = { slug: string; name: string };

type Props = {
  category: string | null;
  material: ProductQueryParams["material"] | undefined;
  categories: CategoryOption[];
  materials: readonly ProductQueryParams["material"][];
  onCategoryChange: (slug: string | null) => void;
  onMaterialChange: (material: ProductQueryParams["material"] | undefined) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
  variant?: "mobile" | "desktop";
};

export function SearchFiltersPanel({
  category,
  material,
  categories,
  materials,
  onCategoryChange,
  onMaterialChange,
  t,
  variant = "mobile",
}: Props) {
  if (variant === "desktop") {
    return (
      <div className="bg-surface ring-1 ring-hairline rounded-2xl p-5 shadow-soft space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t("search.refineResults")}
          </p>
        </div>
        <DesktopFilterGroup label={t("search.filterCategory")}>
          <DesktopFilterOption
            active={category === null}
            onClick={() => onCategoryChange(null)}
            label={t("search.filterAll")}
          />
          {categories.map((item) => (
            <DesktopFilterOption
              key={item.slug}
              active={category === item.slug}
              onClick={() => onCategoryChange(item.slug)}
              label={item.name}
            />
          ))}
        </DesktopFilterGroup>
        <DesktopFilterGroup label={t("search.filterMaterial")}>
          <DesktopFilterOption
            active={!material}
            onClick={() => onMaterialChange(undefined)}
            label={t("search.filterAll")}
          />
          {materials.map((item) => (
            <DesktopFilterOption
              key={item}
              active={material === item}
              onClick={() => onMaterialChange(item)}
              label={t(`material.${item}`)}
            />
          ))}
        </DesktopFilterGroup>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MobileFilterGroup label={t("search.filterCategory")}>
        <MobileChip active={category === null} onClick={() => onCategoryChange(null)}>
          {t("search.filterAll")}
        </MobileChip>
        {categories.map((item) => (
          <MobileChip
            key={item.slug}
            active={category === item.slug}
            onClick={() => onCategoryChange(item.slug)}
          >
            {item.name}
          </MobileChip>
        ))}
      </MobileFilterGroup>

      <MobileFilterGroup label={t("search.filterMaterial")}>
        <MobileChip active={!material} onClick={() => onMaterialChange(undefined)}>
          {t("search.filterAll")}
        </MobileChip>
        {materials.map((item) => (
          <MobileChip key={item} active={material === item} onClick={() => onMaterialChange(item)}>
            {t(`material.${item}`)}
          </MobileChip>
        ))}
      </MobileFilterGroup>
    </div>
  );
}

function MobileChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 h-9 px-3.5 rounded-full text-xs font-medium press ring-1 ${
        active
          ? "bg-foreground text-background ring-foreground"
          : "bg-surface text-muted-foreground ring-hairline hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function MobileFilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function DesktopFilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
        {label}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DesktopFilterOption({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left h-10 px-3.5 rounded-lg text-sm font-medium press transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}
