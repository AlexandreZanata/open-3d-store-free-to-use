import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchAdminStoreUser,
  fetchAdminStoreUsers,
  updateAdminStoreUser,
  type AdminStoreUserQuery,
} from "@/lib/api/store-users";

function stableStoreUserQueryKey(params: AdminStoreUserQuery = {}) {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    q: params.q ?? "",
  } as const;
}

export const adminStoreUsersQueryKey = (params: AdminStoreUserQuery = {}) =>
  ["admin", "store-users", stableStoreUserQueryKey(params)] as const;

export const adminStoreUserQueryKey = (id: string) => ["admin", "store-user", id] as const;

export function useAdminStoreUsers(params: AdminStoreUserQuery = {}) {
  return useQuery({
    queryKey: adminStoreUsersQueryKey(params),
    queryFn: () => fetchAdminStoreUsers(params),
  });
}

export function useAdminStoreUser(id: string) {
  return useQuery({
    queryKey: adminStoreUserQueryKey(id),
    queryFn: () => fetchAdminStoreUser(id),
    enabled: id.length > 0,
  });
}

export function useUpdateAdminStoreUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => updateAdminStoreUser(id, { isActive }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminStoreUserQueryKey(id) });
      await queryClient.invalidateQueries({ queryKey: ["admin", "store-users"] });
    },
  });
}
