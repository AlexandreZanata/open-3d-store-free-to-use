import type { ShopSettings, ShopConfig } from "@print3d/shared-types";

import type { ShopSettingsRecord } from "../../domain/repositories/IShopSettingsRepository.js";

export function toShopSettingsDto(record: ShopSettingsRecord): ShopSettings {
  return {
    id: record.id,
    whatsappPhone: record.whatsappPhone,
    enabledMaterials: record.enabledMaterials,
    offersDelivery: record.offersDelivery,
    pickupOnly: record.pickupOnly,
    pickupLocation: record.pickupLocation,
    paymentMethods: record.paymentMethods,
    requiresDeposit: record.requiresDeposit,
    depositPercent: record.depositPercent,
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toShopConfigDto(record: ShopSettingsRecord): ShopConfig {
  return {
    enabledMaterials: record.enabledMaterials,
    offersDelivery: record.offersDelivery,
    pickupOnly: record.pickupOnly,
    pickupLocation: record.pickupLocation,
    paymentMethods: record.paymentMethods,
    requiresDeposit: record.requiresDeposit,
    depositPercent: record.depositPercent,
  };
}
