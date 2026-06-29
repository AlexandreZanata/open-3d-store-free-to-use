import type { IShopSettingsRepository } from "../../domain/repositories/IShopSettingsRepository.js";
import { ResourceNotFoundError } from "../errors/ApplicationErrors.js";
import { toShopConfigDto } from "../dtos/ShopSettingsDto.js";

export class GetShopConfig {
  constructor(private readonly settings: IShopSettingsRepository) {}

  async execute() {
    const record = await this.settings.get();
    if (record === null) {
      throw new ResourceNotFoundError("ShopSettings", "default");
    }
    return { data: toShopConfigDto(record) };
  }
}
