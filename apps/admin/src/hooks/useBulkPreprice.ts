import { useMutation, useQueryClient } from "@tanstack/react-query";

import { bulkPrepriceProducts } from "@/lib/api/model-studio";

export function useBulkPrepriceProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkPrepriceProducts,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "product"] });
    },
  });
}
