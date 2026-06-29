import type { MaterialType, PaymentMethod } from "./material.types.js";

/** Public storefront shop policy (no auth). */
export type ShopConfig = {
  enabledMaterials: MaterialType[];
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
