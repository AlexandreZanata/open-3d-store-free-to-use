import type { MaterialType, PaymentMethod } from "./material.types.js";
import type { ShopColor } from "./admin/model-studio.types.js";

/** Public storefront shop policy (no auth). */
export type ShopConfig = {
  enabledMaterials: MaterialType[];
  availableColors: ShopColor[];
  offersDelivery: boolean;
  pickupOnly: boolean;
  pickupLocation: string | null;
  paymentMethods: PaymentMethod[];
  requiresDeposit: boolean;
  depositPercent: number | null;
};

export type ShopConfigResponse = {
  data: ShopConfig;
};
