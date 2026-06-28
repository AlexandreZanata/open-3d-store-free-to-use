import { useMutation, useQuery, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import type {
  AdminProductDetail,
  CreateProductPayload,
  UpdateProductPayload,
} from "@print3d/shared-types";

import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
  type AdminProductQuery,
} from "@/lib/api/products";

export const adminProductsQueryKey = (params: AdminProductQuery = {}) =>
  ["admin", "products", params] as const;

export const adminProductQueryKey = (id: string) => ["admin", "product", id] as const;

export function useAdminProducts(params: AdminProductQuery = {}) {
  return useQuery({
    queryKey: adminProductsQueryKey(params),
    queryFn: () => fetchAdminProducts(params),
  });
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: adminProductQueryKey(id),
    queryFn: () => fetchAdminProduct(id),
    enabled: id.length > 0,
  });
}

export function useCreateProduct(): UseMutationResult<
  AdminProductDetail,
  Error,
  CreateProductPayload
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useUpdateProduct(id: string): UseMutationResult<
  AdminProductDetail,
  Error,
  UpdateProductPayload
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updateAdminProduct>[1]) =>
      updateAdminProduct(id, payload),
    onSuccess: (product) => {
      queryClient.setQueryData(adminProductQueryKey(id), product);
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
