import {
  MATERIAL_TYPES,
  PAYMENT_METHODS,
  type MaterialType,
  type PaymentMethod,
  type ShopSettings,
  type UpdateShopSettingsPayload,
} from "@print3d/shared-types";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/hooks/useToast";

const MATERIAL_LABELS: Record<MaterialType, string> = {
  PLA: "PLA",
  PETG: "PETG",
  PETG_HF: "PETG HF",
  ABS: "ABS",
  ASA: "ASA",
  TPU: "TPU",
  NYLON: "Nylon",
  RESIN: "Resin",
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: "PIX",
  credit_card: "Credit card",
  debit_card: "Debit card",
  cash: "Cash",
};

type ShopSettingsFormProps = {
  settings: ShopSettings;
  onSave: (payload: UpdateShopSettingsPayload) => Promise<void>;
  isSaving: boolean;
};

export function ShopSettingsForm({ settings, onSave, isSaving }: ShopSettingsFormProps) {
  const toast = useToast();
  const [form, setForm] = useState<UpdateShopSettingsPayload>(toFormState(settings));

  useEffect(() => {
    setForm(toFormState(settings));
  }, [settings]);

  function toggleMaterial(material: MaterialType) {
    setForm((current) => {
      const enabled = current.enabledMaterials.includes(material);
      const enabledMaterials = enabled
        ? current.enabledMaterials.filter((item) => item !== material)
        : [...current.enabledMaterials, material];
      return { ...current, enabledMaterials };
    });
  }

  function togglePayment(method: PaymentMethod) {
    setForm((current) => {
      const enabled = current.paymentMethods.includes(method);
      const paymentMethods = enabled
        ? current.paymentMethods.filter((item) => item !== method)
        : [...current.paymentMethods, method];
      return { ...current, paymentMethods };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await onSave(form);
      toast.success("Settings saved");
    } catch {
      toast.error("Could not save settings");
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      <Card className="border-hairline/80 shadow-sm">
        <div className="flex items-start gap-4">
          <img
            src="/brand/corvo-logo.png"
            alt=""
            className="size-16 object-contain"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight">Shop profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              WhatsApp number used for storefront checkout links.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <Input
            label="WhatsApp phone (digits only)"
            value={form.whatsappPhone}
            onChange={(event) => setForm({ ...form, whatsappPhone: event.target.value })}
            placeholder="5565999999999"
          />
        </div>
      </Card>

      <Card className="border-hairline/80 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Materials you print</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shown in admin product forms and storefront filters.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIAL_TYPES.map((material) => (
            <label
              key={material}
              className="flex items-center gap-2 rounded-lg border border-hairline px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/40"
            >
              <input
                type="checkbox"
                checked={form.enabledMaterials.includes(material)}
                onChange={() => toggleMaterial(material)}
                className="size-4 rounded border-hairline"
              />
              <span className="font-medium">{MATERIAL_LABELS[material]}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="border-hairline/80 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Fulfillment</h2>
        <div className="mt-4 space-y-4">
          <ToggleRow
            label="Offers delivery"
            description="Customers can request delivery instead of pickup."
            checked={form.offersDelivery}
            onChange={(offersDelivery) => setForm({ ...form, offersDelivery })}
          />
          <ToggleRow
            label="Pickup only"
            description="Products must be collected at your location."
            checked={form.pickupOnly}
            onChange={(pickupOnly) => setForm({ ...form, pickupOnly })}
          />
          <Textarea
            label="Pickup location"
            value={form.pickupLocation ?? ""}
            onChange={(event) =>
              setForm({ ...form, pickupLocation: event.target.value || null })
            }
            placeholder="Studio address or pickup instructions"
            rows={3}
          />
        </div>
      </Card>

      <Card className="border-hairline/80 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Payments</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method}
              className="flex items-center gap-2 rounded-lg border border-hairline px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/40"
            >
              <input
                type="checkbox"
                checked={form.paymentMethods.includes(method)}
                onChange={() => togglePayment(method)}
                className="size-4 rounded border-hairline"
              />
              <span className="font-medium">{PAYMENT_LABELS[method]}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 space-y-4 border-t border-hairline pt-6">
          <ToggleRow
            label="Require upfront deposit"
            description="Ask for a percentage before starting the print."
            checked={form.requiresDeposit}
            onChange={(requiresDeposit) =>
              setForm({
                ...form,
                requiresDeposit,
                depositPercent: requiresDeposit ? (form.depositPercent ?? 50) : null,
              })
            }
          />
          {form.requiresDeposit ? (
            <Input
              label="Deposit (%)"
              type="number"
              min={1}
              max={100}
              value={form.depositPercent ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  depositPercent: Number.parseInt(event.target.value, 10) || null,
                })
              }
            />
          ) : null}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-lg border border-hairline px-4 py-3 cursor-pointer hover:bg-muted/30">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 rounded border-hairline"
      />
    </label>
  );
}

function toFormState(settings: ShopSettings): UpdateShopSettingsPayload {
  return {
    whatsappPhone: settings.whatsappPhone,
    enabledMaterials: settings.enabledMaterials,
    offersDelivery: settings.offersDelivery,
    pickupOnly: settings.pickupOnly,
    pickupLocation: settings.pickupLocation,
    paymentMethods: settings.paymentMethods,
    requiresDeposit: settings.requiresDeposit,
    depositPercent: settings.depositPercent,
  };
}
