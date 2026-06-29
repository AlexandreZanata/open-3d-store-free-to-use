import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchShopSettings, updateShopSettings } from "@/lib/api/settings";
import type { UpdateShopSettingsPayload } from "@print3d/shared-types";

const SETTINGS_KEY = ["admin", "settings"] as const;

export function useAdminSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: fetchShopSettings,
  });
}

export function useUpdateShopSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateShopSettingsPayload) => updateShopSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
  });
}
