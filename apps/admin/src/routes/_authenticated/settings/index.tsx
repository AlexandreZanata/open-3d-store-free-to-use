import { createFileRoute } from "@tanstack/react-router";

import { ShopSettingsForm } from "@/components/settings/ShopSettingsForm";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAdminSettings, useUpdateShopSettings } from "@/hooks/useAdminSettings";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const settingsQuery = useAdminSettings();
  const updateMutation = useUpdateShopSettings();

  return (
    <>
      <PageHeader
        title="Shop settings"
        description="Configure materials, fulfillment, payments, and WhatsApp for your storefront."
      />

      {settingsQuery.isLoading ? (
        <LoadingSpinner className="py-12" label="Loading settings…" />
      ) : settingsQuery.isError || !settingsQuery.data?.data ? (
        <Card>
          <p className="text-sm text-destructive">
            Could not load shop settings. Run database migrations and seed.
          </p>
        </Card>
      ) : (
        <ShopSettingsForm
          settings={settingsQuery.data.data}
          isSaving={updateMutation.isPending}
          onSave={async (payload) => {
            await updateMutation.mutateAsync(payload);
          }}
        />
      )}
    </>
  );
}
