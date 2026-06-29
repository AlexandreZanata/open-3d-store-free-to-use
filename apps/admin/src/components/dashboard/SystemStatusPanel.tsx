import { useQuery } from "@tanstack/react-query";
import { Activity, Globe, Server } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { adminTokens } from "@/lib/admin-tokens";
import { getApiBaseUrl } from "@/lib/api/client";
import { fetchPublicHealth } from "@/lib/api/orders";
import { cn } from "@/lib/utils";

function formatUptime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function SystemStatusPanel() {
  const healthQuery = useQuery({
    queryKey: ["admin", "dashboard", "health"],
    queryFn: fetchPublicHealth,
    refetchInterval: 60_000,
  });

  const isHealthy = !healthQuery.isError && healthQuery.data?.status === "ok";
  const healthLabel = healthQuery.isLoading
    ? "Checking…"
    : healthQuery.isError
      ? "Unreachable"
      : healthQuery.data?.status ?? "unknown";

  return (
    <Card className="border-hairline/80">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={adminTokens.sectionTitle}>System status</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            API connectivity and runtime health for this admin session.
          </p>
        </div>
        <HealthPill healthy={isHealthy} loading={healthQuery.isLoading} label={healthLabel} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatusTile
          icon={Globe}
          label="API base URL"
          value={getApiBaseUrl()}
          mono
        />
        <StatusTile icon={Server} label="API version" value="REST v1" />
        <StatusTile
          icon={Activity}
          label="Uptime"
          value={
            healthQuery.isLoading
              ? "—"
              : healthQuery.isError
                ? "—"
                : formatUptime(healthQuery.data?.uptime ?? 0)
          }
          detail={healthQuery.isError ? "API unreachable" : undefined}
        />
      </div>
    </Card>
  );
}

function HealthPill({
  healthy,
  loading,
  label,
}: {
  healthy: boolean;
  loading: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        loading
          ? "bg-muted text-muted-foreground"
          : healthy
            ? "bg-emerald-500/10 text-emerald-700"
            : "bg-destructive/10 text-destructive",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          loading ? "bg-muted-foreground" : healthy ? "bg-emerald-500" : "bg-destructive",
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}

function StatusTile({
  icon: Icon,
  label,
  value,
  mono,
  detail,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
  mono?: boolean;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-muted/25 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-surface ring-1 ring-hairline">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className={adminTokens.label}>{label}</p>
          <p
            className={cn(
              "mt-1.5 text-sm font-medium text-foreground",
              mono && "break-all font-mono text-xs font-normal",
            )}
          >
            {value}
          </p>
          {detail ? <p className="mt-1 text-xs text-destructive">{detail}</p> : null}
        </div>
      </div>
    </div>
  );
}
