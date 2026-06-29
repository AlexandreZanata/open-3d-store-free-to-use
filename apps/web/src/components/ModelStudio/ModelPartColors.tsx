import type { ModelPart, ShopColor } from "@print3d/shared-types";
import { useTranslation } from "react-i18next";

type ModelPartColorsProps = {
  parts: ModelPart[];
  colors: ShopColor[];
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
};

export function ModelPartColors({ parts, colors, value, onChange }: ModelPartColorsProps) {
  const { t } = useTranslation();

  if (parts.length === 0) {
    return null;
  }

  function pickPartColor(partId: string, hex: string) {
    onChange({ ...value, [partId]: hex });
  }

  return (
    <div className="space-y-3 rounded-2xl ring-1 ring-hairline bg-surface p-4">
      <h3 className="text-sm font-semibold">{t("product.studioColors")}</h3>
      {parts.map((part) => (
        <div key={part.id} className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">{part.name}</div>
          <div className="flex flex-wrap items-center gap-2">
            {colors.map((color) => {
              const active = value[part.id] === color.hex;
              return (
                <button
                  key={color.id}
                  type="button"
                  title={color.name}
                  aria-label={`${part.name}: ${color.name}`}
                  aria-pressed={active}
                  onClick={() => pickPartColor(part.id, color.hex)}
                  className={`size-8 rounded-full ring-2 transition-transform press ${
                    active ? "ring-foreground scale-110" : "ring-transparent"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              );
            })}
            <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="sr-only">{t("product.customHex")}</span>
              <input
                type="color"
                value={value[part.id] ?? "#9ca3af"}
                onChange={(event) => pickPartColor(part.id, event.target.value.toUpperCase())}
                className="size-8 cursor-pointer rounded border border-hairline bg-transparent"
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
