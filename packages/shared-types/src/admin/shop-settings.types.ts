import type { AdminDataResponse } from "./admin.types.js";
import type { MaterialType, PaymentMethod } from "../material.types.js";
import type {
  CalculatorSettings,
  MaterialPricePerGram,
  ShopColor,
} from "./model-studio.types.js";
import type { ModelPart } from "./model-studio.types.js";

export type ShopSettings = {
  id: string;
  whatsappPhone: string;
  enabledMaterials: MaterialType[];
  availableColors: ShopColor[];
  materialPricing: MaterialPricePerGram;
  calculator: CalculatorSettings;
  offersDelivery: boolean;
  pickupOnly: boolean;
  pickupLocation: string | null;
  paymentMethods: PaymentMethod[];
  requiresDeposit: boolean;
  depositPercent: number | null;
  updatedAt: string;
};

export type UpdateShopSettingsPayload = {
  whatsappPhone: string;
  enabledMaterials: MaterialType[];
  availableColors: ShopColor[];
  materialPricing: MaterialPricePerGram;
  calculator: CalculatorSettings;
  offersDelivery: boolean;
  pickupOnly: boolean;
  pickupLocation: string | null;
  paymentMethods: PaymentMethod[];
  requiresDeposit: boolean;
  depositPercent: number | null;
};

export type ShopSettingsResponse = AdminDataResponse<ShopSettings>;
