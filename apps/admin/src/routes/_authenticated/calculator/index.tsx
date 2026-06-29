import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/hooks/useToast";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { bulkPrepriceProducts } from "@/lib/api/model-studio";
import { formatBrlCents } from "@/lib/money";
import { ApiError } from "@/lib/api/client";
import { formatApiErrorMessage } from "@/lib/utils";
import type { MaterialType, ShopSettings } from "@print3d/shared-types";

export const Route = createFileRoute("/_authenticated/calculator/")({
  component: CalculatorPage,
});

function CalculatorPage() {
  const settingsQuery = useAdminSettings();
  const toast = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<{ updated: number; skipped: number } | null>(null);

  const settings = settingsQuery.data?.data;

  async function handleBulkPreprice() {
    setIsRunning(true);
    try {
      const { data } = await bulkPrepriceProducts();
      setLastResult({ updated: data.updatedCount, skipped: data.skippedCount });
      toast.success(`Updated ${data.updatedCount} product(s)`);
    } catch (error) {
      const detail =
        error instanceof ApiError
          ? formatApiErrorMessage(error.problem.detail, error.problem.title)
          : "Bulk pre-price failed";
      toast.error(detail);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Pre-price calculator"
        description="Per-material rates drive bulk pre-pricing for products with detected model parts."
      />

      {settingsQuery.isLoading ? (
        <LoadingSpinner className="py-12" label="Loading calculator settings…" />
      ) : !settings ? (
        <Card>
          <p className="text-sm text-destructive">Could not load shop settings.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-start gap-3">
              <Calculator className="size-6 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Formula</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pre-price = weight (g) × material price/g + print hours × material machine rate +
                  material handling fee. Each material type has its own rates in Settings.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Default infill: {(settings.calculator.defaultInfillFactor * 100).toFixed(0)}% · Edit
              rates in Settings → Studio.
            </p>
          </Card>

          <MaterialRatesTable settings={settings} />

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">Apply to catalog</h2>
            <p className="text-sm text-muted-foreground">
              Updates base price and total weight using each product&apos;s material row.
            </p>
            <Button type="button" disabled={isRunning} onClick={() => void handleBulkPreprice()}>
              {isRunning ? "Calculating…" : "Run bulk pre-price"}
            </Button>
            {lastResult ? (
              <p className="text-sm text-muted-foreground">
                Last run: {lastResult.updated} updated, {lastResult.skipped} skipped.
              </p>
            ) : null}
          </Card>
        </div>
      )}
    </>
  );
}

function MaterialRatesTable({ settings }: { settings: ShopSettings }) {
  const materials = settings.enabledMaterials;

  if (materials.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">No materials enabled in shop settings.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">Material</th>
            <th className="px-3 py-2 font-medium">Price / g</th>
            <th className="px-3 py-2 font-medium">Machine / h</th>
            <th className="px-3 py-2 font-medium">Handling</th>
            <th className="px-3 py-2 font-medium">Example (50 g, 1 h)</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <MaterialRateRow key={material} material={material} settings={settings} />
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function MaterialRateRow({
  material,
  settings,
}: {
  material: MaterialType;
  settings: ShopSettings;
}) {
  const row = settings.materialPricing[material];
  const pricePerGram = row?.pricePerGramCents ?? 15;
  const machineRate =
    row?.machineHourlyRateCents ?? settings.calculator.machineHourlyRateCents;
  const handling = row?.handlingFeeCents ?? settings.calculator.handlingFeeCents;
  const example = Math.round(50 * pricePerGram + machineRate + handling);

  return (
    <tr className="border-b border-hairline/60 last:border-0">
      <td className="px-3 py-2.5 font-medium">{material}</td>
      <td className="px-3 py-2.5 tabular-nums">{formatBrlCents(pricePerGram)}</td>
      <td className="px-3 py-2.5 tabular-nums">{formatBrlCents(machineRate)}</td>
      <td className="px-3 py-2.5 tabular-nums">{formatBrlCents(handling)}</td>
      <td className="px-3 py-2.5 tabular-nums font-semibold">{formatBrlCents(example)}</td>
    </tr>
  );
}
