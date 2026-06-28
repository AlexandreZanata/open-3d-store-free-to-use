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
};

export function SearchFiltersPanel({
  category,
  material,
  categories,
  materials,
  onCategoryChange,
  onMaterialChange,
  t,
}: Props) {
  return (
    <div className="space-y-4">
      <FilterGroup label={t("search.filterCategory")}>
        <Chip active={category === null} onClick={() => onCategoryChange(null)}>
          {t("search.filterAll")}
        </Chip>
        {categories.map((item) => (
          <Chip
            key={item.slug}
            active={category === item.slug}
            onClick={() => onCategoryChange(item.slug)}
          >
            {item.name}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label={t("search.filterMaterial")}>
        <Chip active={!material} onClick={() => onMaterialChange(undefined)}>
          {t("search.filterAll")}
        </Chip>
        {materials.map((item) => (
          <Chip key={item} active={material === item} onClick={() => onMaterialChange(item)}>
            {t(`material.${item}`)}
          </Chip>
        ))}
      </FilterGroup>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
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

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
