import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAdminStoreUsers } from "@/hooks/useAdminStoreUsers";
import { toTablePagination } from "@/lib/tablePagination";
import type { AdminStoreUserListItem } from "@print3d/shared-types";

type UsersSearch = {
  page: number;
  q: string;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const userColumns: DataTableColumn<AdminStoreUserListItem>[] = [
  {
    id: "name",
    header: "Name",
    cell: (user) => (
      <div>
        <p className="font-medium">{user.displayName}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (user) => (
      <span
        className={
          user.isActive
            ? "inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700"
            : "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
        }
      >
        {user.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    id: "cart",
    header: "Cart",
    cell: (user) => user.cartItemCount,
  },
  {
    id: "favorites",
    header: "Favorites",
    cell: (user) => user.favoriteCount,
  },
  {
    id: "created",
    header: "Created",
    cell: (user) => formatDate(user.createdAt),
  },
  {
    id: "actions",
    header: "Actions",
    align: "right",
    cell: (user) => (
      <Link to="/users/$id" params={{ id: user.id }}>
        <Button variant="secondary">View</Button>
      </Link>
    ),
  },
];

export const Route = createFileRoute("/_authenticated/users/")({
  validateSearch: (search: Record<string, never>): UsersSearch => ({
    page: Number(search.page) > 0 ? Number(search.page) : 1,
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: UsersListPage,
});

function UsersListPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const usersQuery = useAdminStoreUsers({
    page: search.page,
    limit: 20,
    q: search.q || undefined,
  });

  const users = usersQuery.data?.data ?? [];
  const pagination = usersQuery.data?.pagination;

  function goToPage(page: number) {
    void navigate({ to: "/users", search: { page, q: search.q } });
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Storefront shopper accounts — cart and favorites persistence."
      />

      <form
        className="mb-4 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const raw = formData.get("q");
          const q = typeof raw === "string" ? raw : "";
          void navigate({ to: "/users", search: { page: 1, q } });
        }}
      >
        <input
          name="q"
          defaultValue={search.q}
          placeholder="Search by email"
          className="h-10 min-w-[14rem] flex-1 rounded-md border border-hairline bg-background px-3 text-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {usersQuery.isLoading ? <LoadingSpinner className="py-12" /> : null}

      {usersQuery.isError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Could not load users. Check the API connection and try again.
        </p>
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? (
        <EmptyState
          title="No users yet"
          description="Shopper accounts appear here after customers register on the storefront."
        />
      ) : null}

      {users.length > 0 ? (
        <DataTable
          caption="Storefront users"
          columns={userColumns}
          rows={users}
          getRowKey={(user) => user.id}
          pagination={pagination ? toTablePagination(pagination) : null}
          onPageChange={goToPage}
        />
      ) : null}
    </>
  );
}
