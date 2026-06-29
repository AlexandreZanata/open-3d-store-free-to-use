import {
  MATERIAL_TYPES,
  type CalculatorSettings,
  type MaterialPricePerGram,
  type MaterialType,
  type UpdateShopSettingsPayload,
} from "@print3d/shared-types";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { centsToReaisInput, reaisToCents } from "@/lib/money";

type StudioPricingFieldsProps = {
  form: UpdateShopSettingsPayload;
  onChange: (next: UpdateShopSettingsPayload) => void;
};

export function StudioPricingFields({ form, onChange }: StudioPricingFieldsProps) {
  return (
    <>
      <Card className="border-hairline/80 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Material pricing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Price per gram (BRL) and density (g/cm³) for pre-price calculation. PLA ≈ 1.24 g/cm³
            (Prusa datasheets).
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {MATERIAL_TYPES.map((material) => (
            <MaterialPricingRow
              key={material}
              material={material}
              entry={form.materialPricing[material]}
              onChange={(entry) =>
                onChange({
                  ...form,
                  materialPricing: { ...form.materialPricing, [material]: entry },
                })
              }
            />
          ))}
        </div>
      </Card>

      <Card className="border-hairline/80 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Calculator defaults</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Machine hourly rate + handling fee + infill factor for volume→weight estimates.
          </p>
        </div>
        <CalculatorFields
          value={form.calculator}
          onChange={(calculator) => onChange({ ...form, calculator })}
        />
      </Card>
    </>
  );
}

function MaterialPricingRow({
  material,
  entry,
  onChange,
}: {
  material: MaterialType;
  entry: MaterialPricePerGram[MaterialType] | undefined;
  onChange: (entry: NonNullable<MaterialPricePerGram[MaterialType]>) => void;
}) {
  const priceReais = centsToReaisInput(entry?.pricePerGramCents ?? 0);
  const density = entry?.densityGCm3 ?? 1.24;

  return (
    <div className="rounded-lg border border-hairline p-3 space-y-2">
      <div className="text-sm font-medium">{material}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          label="Price / gram (BRL)"
          value={priceReais}
          onChange={(event) => {
            const cents = reaisToCents(event.target.value);
            if (!Number.isNaN(cents)) {
              onChange({ pricePerGramCents: cents, densityGCm3: density });
            }
          }}
        />
        <Input
          label="Density (g/cm³)"
          type="number"
          min={0.5}
          step={0.01}
          value={density}
          onChange={(event) => {
            const next = Number.parseFloat(event.target.value);
            if (Number.isFinite(next) && next > 0) {
              onChange({
                pricePerGramCents: entry?.pricePerGramCents ?? 15,
                densityGCm3: next,
              });
            }
          }}
        />
      </div>
    </div>
  );
}

function CalculatorFields({
  value,
  onChange,
}: {
  value: CalculatorSettings;
  onChange: (next: CalculatorSettings) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Input
        label="Machine rate (BRL / hour)"
        value={centsToReaisInput(value.machineHourlyRateCents)}
        onChange={(event) => {
          const cents = reaisToCents(event.target.value);
          if (!Number.isNaN(cents)) {
            onChange({ ...value, machineHourlyRateCents: cents });
          }
        }}
      />
      <Input
        label="Handling fee (BRL)"
        value={centsToReaisInput(value.handlingFeeCents)}
        onChange={(event) => {
          const cents = reaisToCents(event.target.value);
          if (!Number.isNaN(cents)) {
            onChange({ ...value, handlingFeeCents: cents });
          }
        }}
      />
      <Input
        label="Default infill (0–1)"
        type="number"
        min={0}
        max={1}
        step={0.05}
        value={value.defaultInfillFactor}
        onChange={(event) => {
          const next = Number.parseFloat(event.target.value);
          if (Number.isFinite(next)) {
            onChange({ ...value, defaultInfillFactor: Math.min(1, Math.max(0, next)) });
          }
        }}
      />
    </div>
  );
}
