import type { ModelPart } from "@print3d/shared-types";

import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import type { IShopSettingsRepository } from "../../../domain/repositories/IShopSettingsRepository.js";
import { calculatePrepriceCents } from "../../../domain/services/pricingCalculator.js";
import { ResourceNotFoundError } from "../../errors/ApplicationErrors.js";
import type { AuditLogger } from "../../services/AuditLogger.js";

export class BulkPrepriceProducts {
  constructor(
    private readonly products: IProductRepository,
    private readonly shopSettings: IShopSettingsRepository,
    private readonly audit: AuditLogger,
  ) {}

  async execute(input: { adminId: string }) {
    const settings = await this.shopSettings.get();
    if (settings === null) {
      throw new ResourceNotFoundError("ShopSettings", "default");
    }

    const candidates = await this.products.listForBulkPreprice();
    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of candidates) {
      const totalWeight = sumPartWeight(product.modelParts);
      if (totalWeight <= 0) {
        skippedCount += 1;
        continue;
      }

      const basePrice = calculatePrepriceCents({
        material: product.material,
        weightGrams: totalWeight,
        printTimeHours: product.printTimeHours,
        materialPricing: settings.materialPricing,
        calculator: settings.calculator,
      });

      await this.products.updatePreprice(product.id, basePrice, totalWeight);
      updatedCount += 1;
    }

    await this.audit.log({
      adminUserId: input.adminId,
      action: "admin.products.bulk_preprice",
      resourceType: "product",
      resourceId: null,
      metadata: {},
    });

    return { data: { updatedCount, skippedCount } };
  }
}

function sumPartWeight(parts: ModelPart[]): number {
  return parts.reduce((sum, part) => sum + (part.weightGrams ?? 0), 0);
}
