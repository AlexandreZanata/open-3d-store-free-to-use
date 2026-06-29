import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageBackLink } from "@/components/ui/PageBackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  adminStoreUserQueryKey,
  useAdminStoreUser,
  useUpdateAdminStoreUser,
} from "@/hooks/useAdminStoreUsers";
import { fetchAdminStoreUser } from "@/lib/api/store-users";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-foreground">Account</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>{user.isActive ? "Active" : "Inactive"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{formatDate(user.updatedAt)}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <Button
              variant={user.isActive ? "secondary" : "primary"}
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate(!user.isActive)}
            >
              {user.isActive ? "Deactivate account" : "Reactivate account"}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-foreground">Registration</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">IP address</dt>
              <dd className="font-mono text-xs">{user.registrationIp ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Device ID</dt>
              <dd className="break-all font-mono text-xs">{user.registrationDeviceId ?? "—"}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-foreground">Saved data</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Cart items</dt>
              <dd>{user.cartItemCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Favorites</dt>
              <dd>{user.favoriteCount}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  );
}
