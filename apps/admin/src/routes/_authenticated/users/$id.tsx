import { createFileRoute } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DetailField, DetailFields } from "@/components/ui/DetailFields";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageBackLink } from "@/components/ui/PageBackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  adminStoreUserQueryKey,
  useAdminStoreUser,
  useUpdateAdminStoreUser,
} from "@/hooks/useAdminStoreUsers";
import { adminTokens } from "@/lib/admin-tokens";
import { fetchAdminStoreUser } from "@/lib/api/store-users";
import { cn } from "@/lib/utils";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatUserId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export const Route = createFileRoute("/_authenticated/users/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData({
      queryKey: adminStoreUserQueryKey(params.id),
      queryFn: () => fetchAdminStoreUser(params.id),
    }),
  component: UserDetailPage,
});

function UserDetailPage() {
  const { id } = Route.useParams();
  const userQuery = useAdminStoreUser(id);
  const updateMutation = useUpdateAdminStoreUser(id);

  if (userQuery.isLoading || !userQuery.data) {
    return <LoadingSpinner className="py-12" />;
  }

  const user = userQuery.data;

  return (
    <>
      <PageHeader
        back={<PageBackLink to="/users" search={{ page: 1, q: "" }} label="Back to users" />}
        title={user.displayName}
        description={user.email}
      />

      <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
        <Card className="lg:col-span-2">
          <h2 className={adminTokens.sectionTitle}>Overview</h2>
          <DetailFields className="mt-5">
            <DetailField label="User ID">
              <span className="font-mono text-xs text-muted-foreground" title={user.id}>
                {formatUserId(user.id)}
              </span>
            </DetailField>
            <DetailField label="Status">
              <UserStatusBadge active={user.isActive} />
            </DetailField>
            <DetailField label="Display name">{user.displayName}</DetailField>
            <DetailField label="Email">
              <span className="break-all">{user.email}</span>
            </DetailField>
            <DetailField label="Created">{formatDate(user.createdAt)}</DetailField>
            <DetailField label="Last updated">{formatDate(user.updatedAt)}</DetailField>
          </DetailFields>

          <div className="mt-6 border-t border-hairline pt-6">
            <h3 className={adminTokens.label}>Saved on account</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SavedDataStat
                icon={ShoppingBag}
                label="Cart items"
                value={user.cartItemCount}
              />
              <SavedDataStat icon={Heart} label="Favorites" value={user.favoriteCount} />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className={adminTokens.sectionTitle}>Account control</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {user.isActive
                ? "Deactivating clears active sessions and blocks storefront login."
                : "Reactivate to allow this shopper to sign in again."}
            </p>
            <Button
              variant={user.isActive ? "danger" : "primary"}
              className="mt-5 w-full"
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate(!user.isActive)}
            >
              {updateMutation.isPending
                ? "Saving…"
                : user.isActive
                  ? "Deactivate account"
                  : "Reactivate account"}
            </Button>
          </Card>

          <Card>
            <h2 className={adminTokens.sectionTitle}>Registration origin</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Captured at sign-up for abuse limits (max 2 accounts per IP and device).
            </p>
            <DetailFields columns={1} className="mt-5">
              <DetailField label="IP address">
                <span className="font-mono text-xs">{user.registrationIp ?? "—"}</span>
              </DetailField>
              <DetailField label="Device ID">
                <span className="break-all font-mono text-xs">
                  {user.registrationDeviceId ?? "—"}
                </span>
              </DetailField>
            </DetailFields>
          </Card>
        </div>
      </div>
    </>
  );
}

function UserStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        active
          ? "bg-emerald-500/10 text-emerald-700"
          : "bg-muted text-muted-foreground",
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function SavedDataStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-hairline bg-muted/30 px-4 py-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-surface ring-1 ring-hairline">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tabular-nums tracking-tight">{value}</p>
      </div>
    </div>
  );
}
