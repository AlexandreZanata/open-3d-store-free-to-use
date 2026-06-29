import type { ShopColor, UpdateShopSettingsPayload } from "@print3d/shared-types";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { StudioPricingFields } from "./StudioPricingFields";

const FILAMENT_PRESETS: ShopColor[] = [
  { id: "pla-white", name: "White", hex: "#F5F5F5" },
  { id: "pla-black", name: "Black", hex: "#1A1A1A" },
  { id: "pla-red", name: "Red", hex: "#C62828" },
  { id: "pla-blue", name: "Blue", hex: "#1565C0" },
  { id: "pla-green", name: "Green", hex: "#2E7D32" },
];

type StudioSettingsCardProps = {
  form: UpdateShopSettingsPayload;
  onChange: (next: UpdateShopSettingsPayload) => void;
};

export function StudioSettingsCard({ form, onChange }: StudioSettingsCardProps) {
  return (
    <>
      <Card className="border-hairline/80 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Studio colors</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Palette for per-part coloring in the storefront 3D studio. Use hex (#RRGGBB).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              onChange({
                ...form,
                availableColors: FILAMENT_PRESETS.map((color) => ({ ...color })),
              })
            }
          >
            Load filament presets
          </Button>
          <Button type="button" variant="secondary" onClick={() => addColor(form, onChange)}>
            Add color
          </Button>
        </div>
        <div className="space-y-3">
          {form.availableColors.map((color, index) => (
            <ColorRow
              key={color.id}
              color={color}
              onChange={(next) => {
                const availableColors = [...form.availableColors];
                availableColors[index] = next;
                onChange({ ...form, availableColors });
              }}
              onRemove={() =>
                onChange({
                  ...form,
                  availableColors: form.availableColors.filter((_, i) => i !== index),
                })
              }
            />
          ))}
          {form.availableColors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No colors configured yet.</p>
          ) : null}
        </div>
      </Card>

      <StudioPricingFields form={form} onChange={onChange} />
    </>
  );
}

function addColor(
  form: UpdateShopSettingsPayload,
  onChange: (next: UpdateShopSettingsPayload) => void,
): void {
  const id = `color-${Date.now()}`;
  onChange({
    ...form,
    availableColors: [...form.availableColors, { id, name: "Custom", hex: "#808080" }],
  });
}

function ColorRow({
  color,
  onChange,
  onRemove,
}: {
  color: ShopColor;
  onChange: (next: ShopColor) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-hairline p-3">
      <div
        className="size-10 shrink-0 rounded-md border border-hairline"
        style={{ backgroundColor: color.hex }}
        aria-hidden
      />
      <Input
        label="Name"
        value={color.name}
        onChange={(event) => onChange({ ...color, name: event.target.value })}
      />
      <Input
        label="Hex"
        value={color.hex}
        onChange={(event) => onChange({ ...color, hex: event.target.value })}
        placeholder="#RRGGBB"
      />
      <input
        type="color"
        value={color.hex}
        onChange={(event) => onChange({ ...color, hex: event.target.value.toUpperCase() })}
        className="size-10 cursor-pointer rounded border border-hairline"
        aria-label={`Pick color for ${color.name}`}
      />
      <Button type="button" variant="ghost" onClick={onRemove}>
        Remove
      </Button>
    </div>
  );
}
