import {
  MATERIAL_TYPES,
  type CalculatorSettings,
  type MaterialPricePerGram,
  type MaterialPricingEntry,
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
          <h2 className="text-lg font-semibold tracking-tight">Material calculator rates</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Per-material price/g, density, machine rate, and handling fee for bulk pre-price.
          </p>
        </div>
        <div className="grid gap-4">
          {MATERIAL_TYPES.map((material) => (
            <MaterialPricingRow
              key={material}
              material={material}
              enabled={form.enabledMaterials.includes(material)}
              entry={resolveEntry(material, form)}
              fallback={form.calculator}
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
          <h2 className="text-lg font-semibold tracking-tight">Calculator fallbacks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fallback machine/handling when a material row omits them. Infill applies to mesh weight.
          </p>
        </div>
        <CalculatorFallbackFields
          value={form.calculator}
          onChange={(calculator) => onChange({ ...form, calculator })}
        />
      </Card>
    </>
  );
}

function resolveEntry(
  material: MaterialType,
  form: UpdateShopSettingsPayload,
): MaterialPricingEntry {
  const existing = form.materialPricing[material];
  if (existing) {
    return existing;
  }
  return {
    pricePerGramCents: 15,
    densityGCm3: 1.24,
    machineHourlyRateCents: form.calculator.machineHourlyRateCents,
    handlingFeeCents: form.calculator.handlingFeeCents,
  };
}

function MaterialPricingRow({
  material,
  enabled,
  entry,
  fallback,
  onChange,
}: {
  material: MaterialType;
  enabled: boolean;
  entry: MaterialPricingEntry;
  fallback: CalculatorSettings;
  onChange: (entry: MaterialPricingEntry) => void;
}) {
  const machineRate = entry.machineHourlyRateCents ?? fallback.machineHourlyRateCents;
  const handlingFee = entry.handlingFeeCents ?? fallback.handlingFeeCents;

  return (
    <div
      className={`rounded-lg border p-3 space-y-3 ${
        enabled ? "border-hairline" : "border-hairline/50 opacity-70"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">{material}</div>
        {enabled ? (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Enabled in shop
          </span>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Not offered
          </span>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <MoneyInput
          label="Price / gram (BRL)"
          cents={entry.pricePerGramCents}
          onChange={(pricePerGramCents) => onChange({ ...entry, pricePerGramCents })}
        />
        <Input
          label="Density (g/cm³)"
          type="number"
          min={0.5}
          step={0.01}
          value={entry.densityGCm3}
          onChange={(event) => {
            const next = Number.parseFloat(event.target.value);
            if (Number.isFinite(next) && next > 0) {
              onChange({ ...entry, densityGCm3: next });
            }
          }}
        />
        <MoneyInput
          label="Machine rate (BRL / h)"
          cents={machineRate}
          onChange={(machineHourlyRateCents) => onChange({ ...entry, machineHourlyRateCents })}
        />
        <MoneyInput
          label="Handling fee (BRL)"
          cents={handlingFee}
          onChange={(handlingFeeCents) => onChange({ ...entry, handlingFeeCents })}
        />
      </div>
    </div>
  );
}

function MoneyInput({
  label,
  cents,
  onChange,
}: {
  label: string;
  cents: number;
  onChange: (cents: number) => void;
}) {
  return (
    <Input
      label={label}
      value={centsToReaisInput(cents)}
      onChange={(event) => {
        const next = reaisToCents(event.target.value);
        if (!Number.isNaN(next)) {
          onChange(next);
        }
      }}
    />
  );
}

function CalculatorFallbackFields({
  value,
  onChange,
}: {
  value: CalculatorSettings;
  onChange: (next: CalculatorSettings) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MoneyInput
        label="Fallback machine rate (BRL / h)"
        cents={value.machineHourlyRateCents}
        onChange={(machineHourlyRateCents) => onChange({ ...value, machineHourlyRateCents })}
      />
      <MoneyInput
        label="Fallback handling fee (BRL)"
        cents={value.handlingFeeCents}
        onChange={(handlingFeeCents) => onChange({ ...value, handlingFeeCents })}
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
