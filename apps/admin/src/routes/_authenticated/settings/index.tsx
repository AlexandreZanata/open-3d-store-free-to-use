import { createFileRoute } from "@tanstack/react-router";

import { ShopSettingsForm } from "@/components/settings/ShopSettingsForm";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAdminSettings, useUpdateShopSettings } from "@/hooks/useAdminSettings";
import { fetchPublicHealth } from "@/lib/api/orders";
import { getApiBaseUrl } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const settingsQuery = useAdminSettings();
  const updateMutation = useUpdateShopSettings();
  const healthQuery = useQuery({
    queryKey: ["admin", "settings", "health"],
    queryFn: fetchPublicHealth,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Shop settings"
        description="Configure materials, fulfillment, payments, and WhatsApp for your storefront."
      />

      {settingsQuery.isLoading ? (
        <LoadingSpinner label="Loading settings…" />
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

      <Card className="border-hairline/60 bg-muted/20">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          System status
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-muted-foreground">API base URL</dt>
            <dd className="mt-1 font-mono text-xs break-all">{getApiBaseUrl()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">API version</dt>
            <dd className="mt-1">REST v1</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Health</dt>
            <dd className="mt-1">
              {healthQuery.isLoading ? (
                "Checking…"
              ) : healthQuery.isError ? (
                "Unreachable"
              ) : (
                `${healthQuery.data?.status ?? "unknown"} · ${healthQuery.data?.uptime ?? 0}s uptime`
              )}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
