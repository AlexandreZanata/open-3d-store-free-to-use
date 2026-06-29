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
        description="Apply material cost + machine time + handling fee to all products with detected model parts."
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
                  Pre-price (centavos) = weight (g) × price/g + print hours × machine rate + handling
                  fee. Weight comes from model part analysis (bounding box × infill × density).
                </p>
              </div>
            </div>
            <dl className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-lg border border-hairline p-3">
                <dt className="text-muted-foreground">Machine rate</dt>
                <dd className="font-semibold tabular-nums">
                  {formatBrlCents(settings.calculator.machineHourlyRateCents)} / h
                </dd>
              </div>
              <div className="rounded-lg border border-hairline p-3">
                <dt className="text-muted-foreground">Handling fee</dt>
                <dd className="font-semibold tabular-nums">
                  {formatBrlCents(settings.calculator.handlingFeeCents)}
                </dd>
              </div>
              <div className="rounded-lg border border-hairline p-3">
                <dt className="text-muted-foreground">Default infill</dt>
                <dd className="font-semibold tabular-nums">
                  {(settings.calculator.defaultInfillFactor * 100).toFixed(0)}%
                </dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">
              Edit rates in Settings → Studio (material pricing & calculator). References: All3DP cost
              guide; filament density from Prusa/MatterHackers datasheets.
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">Apply to catalog</h2>
            <p className="text-sm text-muted-foreground">
              Updates base price and total weight for every product with non-empty model parts.
              Products without parts are skipped.
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
