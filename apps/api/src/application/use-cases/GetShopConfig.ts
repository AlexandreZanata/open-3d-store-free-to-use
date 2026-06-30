import type { IProductRepository } from "../../domain/repositories/IProductRepository.js";
import type { IShopSettingsRepository } from "../../domain/repositories/IShopSettingsRepository.js";
import { ResourceNotFoundError } from "../errors/ApplicationErrors.js";
import { toShopConfigDto } from "../dtos/ShopSettingsDto.js";

export class GetShopConfig {
  constructor(
    private readonly settings: IShopSettingsRepository,
    private readonly products: IProductRepository,
  ) {}

  async execute() {
    const record = await this.settings.get();
    if (record === null) {
      throw new ResourceNotFoundError("ShopSettings", "default");
    }
    const catalogMaterials = await this.products.findDistinctActiveMaterials();
    return { data: toShopConfigDto(record, catalogMaterials) };
  }
}
