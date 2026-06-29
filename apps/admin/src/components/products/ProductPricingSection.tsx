import { useState } from "react";

import type { ProductFormState } from "@/components/products/productFormState";
import { resolveWeightGrams } from "@/components/products/productFormState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useBulkPrepriceProducts } from "@/hooks/useBulkPreprice";
import { useToast } from "@/hooks/useToast";
import { adminTokens } from "@/lib/admin-tokens";
import { ApiError } from "@/lib/api/client";
import { calculatePrepriceCents, parsePrintTimeHoursInput } from "@/lib/prepriceCalculator";
import { centsToReaisInput } from "@/lib/money";
import { formatApiErrorMessage } from "@/lib/utils";

type ProductPricingSectionProps = {
  state: ProductFormState;
  errors: Record<string, string>;
  onPatch: (patch: Partial<ProductFormState>) => void;
};

export function ProductPricingSection({ state, errors, onPatch }: ProductPricingSectionProps) {
  const toast = useToast();
  const settingsQuery = useAdminSettings();
  const bulkMutation = useBulkPrepriceProducts();
  const [confirmBulk, setConfirmBulk] = useState(false);

  function applyPreprice() {
    const settings = settingsQuery.data?.data;
    if (!settings) {
      toast.error("Load shop calculator settings first (Settings → Studio).");
      return;
    }

    const weightGrams = resolveWeightGrams(state);
    const printTimeHours = parsePrintTimeHoursInput(state.printTimeHours);

    if (weightGrams <= 0) {
      toast.error("Enter weight in grams or upload a model with detected parts.");
      return;
    }

    const cents = calculatePrepriceCents({
      material: state.material,
      weightGrams,
      printTimeHours,
      materialPricing: settings.materialPricing,
      calculator: settings.calculator,
    });

    onPatch({ basePriceReais: centsToReaisInput(cents) });
    toast.success(`Pre-price applied: ${centsToReaisInput(cents)} BRL`);
  }

  async function handleBulkPreprice() {
    try {
      const { data } = await bulkMutation.mutateAsync();
      setConfirmBulk(false);
      toast.success(`Updated ${data.updatedCount} product(s), skipped ${data.skippedCount}.`);
    } catch (error) {
      const detail =
        error instanceof ApiError
          ? formatApiErrorMessage(error.problem.detail, error.problem.title)
          : "Bulk pre-price failed";
      toast.error(detail);
      setConfirmBulk(false);
    }
  }

  return (
    <>
      <Card className="space-y-4">
        <h2 className={adminTokens.sectionTitle}>Pricing & specs</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Price (BRL)"
            value={state.basePriceReais}
            onChange={(event) => onPatch({ basePriceReais: event.target.value })}
            error={errors.basePriceReais}
          />
          <Input
            label="Print time (hours)"
            type="number"
            min={0}
            step={0.1}
            value={state.printTimeHours}
            onChange={(event) => onPatch({ printTimeHours: event.target.value })}
          />
          <Input
            label="Weight (grams)"
            type="number"
            min={0}
            value={state.weightGrams}
            onChange={(event) => onPatch({ weightGrams: event.target.value })}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={applyPreprice}>
            Use pre-calculated price
          </Button>
          <Button type="button" variant="secondary" onClick={() => setConfirmBulk(true)}>
            Update all product prices
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Pre-price uses material, grams, and print hours (converted internally for machine cost).
          Bulk update recalculates every product that has model parts.
        </p>
        <Input
          label="Tags (comma separated)"
          value={state.tags}
          onChange={(event) => onPatch({ tags: event.target.value })}
        />
      </Card>

      <ConfirmDialog
        open={confirmBulk}
        title="Update all product prices"
        message="Recalculate base price and weight for every product with detected model parts, using each product's material and shop calculator rates. Unsaved changes on this page are not included until you save."
        confirmLabel="Update all prices"
        isLoading={bulkMutation.isPending}
        onCancel={() => setConfirmBulk(false)}
        onConfirm={() => void handleBulkPreprice()}
      />
    </>
  );
}
