import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchPublicHealth } from "@/lib/api/orders";
import { getApiBaseUrl } from "@/lib/api/client";
import { readEnvString } from "@/lib/env";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const healthQuery = useQuery({
    queryKey: ["admin", "settings", "health"],
    queryFn: fetchPublicHealth,
  });

  const whatsappPhone = readEnvString("VITE_WHATSAPP_PHONE") ?? "Not configured in admin .env";

  return (
    <>
      <PageHeader
        title="Settings"
        description="Read-only shop configuration (editable settings planned for v2)."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-foreground">WhatsApp</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Storefront checkout uses this number for wa.me links (display only — configured on API).
          </p>
          <p className="mt-4 font-mono text-sm">{whatsappPhone}</p>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-foreground">API</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Base URL</dt>
              <dd className="font-mono">{getApiBaseUrl()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Version</dt>
              <dd>REST v1 (`/api/v1`)</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Health</dt>
              <dd>
                {healthQuery.isLoading ? (
                  <LoadingSpinner label="Checking API…" />
                ) : healthQuery.isError ? (
                  "Unreachable"
                ) : (
                  `${healthQuery.data?.status ?? "unknown"} (uptime ${healthQuery.data?.uptime ?? 0}s)`
                )}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  );
}
