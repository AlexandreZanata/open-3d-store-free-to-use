import { MATERIAL_TYPES, PAYMENT_METHODS } from "@print3d/shared-types";

import { loadConfig } from "../src/config.js";
import { createDb } from "../src/infrastructure/db/client.js";
import {
  DrizzleShopSettingsRepository,
  SHOP_SETTINGS_SEED_DEFAULTS,
} from "../src/infrastructure/repositories/DrizzleShopSettingsRepository.js";

export async function seedShopSettings(
  connectionString: string,
  env: Record<string, string | undefined> = process.env,
): Promise<void> {
  const config = loadConfig(env);
  const { db, pool } = createDb(connectionString);
  const repo = new DrizzleShopSettingsRepository(db);

  try {
    await repo.upsert({
      whatsappPhone: config.WHATSAPP_PHONE_NUMBER,
      enabledMaterials: [...MATERIAL_TYPES],
      availableColors: SHOP_SETTINGS_SEED_DEFAULTS.availableColors,
      materialPricing: SHOP_SETTINGS_SEED_DEFAULTS.materialPricing,
      calculator: SHOP_SETTINGS_SEED_DEFAULTS.calculator,
      offersDelivery: false,
      pickupOnly: true,
      pickupLocation: "Pickup at the studio — Cuiabá, MT",
      paymentMethods: ["pix", "credit_card", "debit_card"],
      requiresDeposit: true,
      depositPercent: 50,
    });
  } finally {
    await pool.end();
  }
}
