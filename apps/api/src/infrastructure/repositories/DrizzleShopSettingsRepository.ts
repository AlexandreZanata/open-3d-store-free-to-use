import { eq } from "drizzle-orm";

import type { MaterialType, PaymentMethod } from "@print3d/shared-types";

import type { Database } from "../db/client.js";
import { shopSettings } from "../db/schema.js";
import type {
  IShopSettingsRepository,
  ShopSettingsRecord,
  ShopSettingsUpdate,
} from "../../domain/repositories/IShopSettingsRepository.js";

const SINGLETON_KEY = "default";

function mapRow(row: typeof shopSettings.$inferSelect): ShopSettingsRecord {
  return {
    id: row.id,
    whatsappPhone: row.whatsappPhone,
    enabledMaterials: row.enabledMaterials as MaterialType[],
    offersDelivery: row.offersDelivery,
    pickupOnly: row.pickupOnly,
    pickupLocation: row.pickupLocation,
    paymentMethods: row.paymentMethods as PaymentMethod[],
    requiresDeposit: row.requiresDeposit,
    depositPercent: row.depositPercent,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleShopSettingsRepository implements IShopSettingsRepository {
  constructor(private readonly db: Database) {}

  async get(): Promise<ShopSettingsRecord | null> {
    const rows = await this.db
      .select()
      .from(shopSettings)
      .where(eq(shopSettings.singletonKey, SINGLETON_KEY))
      .limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async upsert(input: ShopSettingsUpdate): Promise<ShopSettingsRecord> {
    const existing = await this.get();
    if (existing === null) {
      const inserted = await this.db
        .insert(shopSettings)
        .values({
          singletonKey: SINGLETON_KEY,
          whatsappPhone: input.whatsappPhone,
          enabledMaterials: input.enabledMaterials,
          offersDelivery: input.offersDelivery,
          pickupOnly: input.pickupOnly,
          pickupLocation: input.pickupLocation,
          paymentMethods: input.paymentMethods,
          requiresDeposit: input.requiresDeposit,
          depositPercent: input.depositPercent,
        })
        .returning();
      return mapRow(inserted[0]!);
    }

    const updated = await this.db
      .update(shopSettings)
      .set({
        whatsappPhone: input.whatsappPhone,
        enabledMaterials: input.enabledMaterials,
        offersDelivery: input.offersDelivery,
        pickupOnly: input.pickupOnly,
        pickupLocation: input.pickupLocation,
        paymentMethods: input.paymentMethods,
        requiresDeposit: input.requiresDeposit,
        depositPercent: input.depositPercent,
        updatedAt: new Date(),
      })
      .where(eq(shopSettings.id, existing.id))
      .returning();
    return mapRow(updated[0]!);
  }
}
