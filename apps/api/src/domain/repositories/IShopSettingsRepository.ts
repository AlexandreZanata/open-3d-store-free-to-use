import type { MaterialType, PaymentMethod } from "@print3d/shared-types";

export type ShopSettingsRecord = {
  id: string;
  whatsappPhone: string;
  enabledMaterials: MaterialType[];
  offersDelivery: boolean;
  pickupOnly: boolean;
  pickupLocation: string | null;
  paymentMethods: PaymentMethod[];
  requiresDeposit: boolean;
  depositPercent: number | null;
  updatedAt: Date;
};

export type ShopSettingsUpdate = Omit<ShopSettingsRecord, "id" | "updatedAt">;

export interface IShopSettingsRepository {
  get(): Promise<ShopSettingsRecord | null>;
  upsert(input: ShopSettingsUpdate): Promise<ShopSettingsRecord>;
}
