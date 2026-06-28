import { useMutation, useQuery, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import type {
  AdminCategoryDetail,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@print3d/shared-types";

import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  fetchAdminCategory,
  updateAdminCategory,
} from "@/lib/api/categories";

export const adminCategoriesQueryKey = ["admin", "categories"] as const;

export const adminCategoryQueryKey = (id: string) => ["admin", "category", id] as const;

export function useAdminCategories() {
  return useQuery({
    queryKey: adminCategoriesQueryKey,
    queryFn: fetchAdminCategories,
  });
}

export function useAdminCategory(id: string) {
  return useQuery({
    queryKey: adminCategoryQueryKey(id),
    queryFn: () => fetchAdminCategory(id),
    enabled: id.length > 0,
  });
}

export function useCreateCategory(): UseMutationResult<
  AdminCategoryDetail,
  Error,
  CreateCategoryPayload
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey });
    },
  });
}

export function useUpdateCategory(id: string): UseMutationResult<
  AdminCategoryDetail,
  Error,
  UpdateCategoryPayload
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updateAdminCategory>[1]) =>
      updateAdminCategory(id, payload),
    onSuccess: (category) => {
      queryClient.setQueryData(adminCategoryQueryKey(id), category);
      void queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey });
    },
  });
}
