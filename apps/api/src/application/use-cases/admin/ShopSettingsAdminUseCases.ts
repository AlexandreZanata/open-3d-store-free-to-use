import type { UpdateShopSettingsPayload } from "@print3d/shared-types";

import type { IShopSettingsRepository } from "../../../domain/repositories/IShopSettingsRepository.js";
import { ResourceNotFoundError } from "../../errors/ApplicationErrors.js";
import type { AuditLogger } from "../../services/AuditLogger.js";
import { toShopSettingsDto } from "../../dtos/ShopSettingsDto.js";

export class GetShopSettingsAdmin {
  constructor(private readonly settings: IShopSettingsRepository) {}

  async execute() {
    const record = await this.settings.get();
    if (record === null) {
      throw new ResourceNotFoundError("ShopSettings", "default");
    }
    return { data: toShopSettingsDto(record) };
  }
}

export class UpdateShopSettingsAdmin {
  constructor(
    private readonly settings: IShopSettingsRepository,
    private readonly audit: AuditLogger,
  ) {}

  async execute(input: { adminId: string; payload: UpdateShopSettingsPayload }) {
    const record = await this.settings.upsert({
      whatsappPhone: input.payload.whatsappPhone,
      enabledMaterials: input.payload.enabledMaterials,
      offersDelivery: input.payload.offersDelivery,
      pickupOnly: input.payload.pickupOnly,
      pickupLocation: input.payload.pickupLocation,
      paymentMethods: input.payload.paymentMethods,
      requiresDeposit: input.payload.requiresDeposit,
      depositPercent: input.payload.depositPercent,
    });

    await this.audit.log({
      adminUserId: input.adminId,
      action: "admin.settings.updated",
      resourceType: "shop_settings",
      resourceId: record.id,
      metadata: {},
    });

    return { data: toShopSettingsDto(record) };
  }
}
