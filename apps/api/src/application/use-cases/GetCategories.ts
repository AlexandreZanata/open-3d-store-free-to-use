import type { ICategoryRepository } from "../../domain/repositories/ICategoryRepository.js";
import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type { ICacheService } from "../ports/ICacheService.js";
import { CACHE_TTL, categoriesCacheKey } from "../cache/cacheKeys.js";
import {
  toCategoryDto,
  type CategoryDto,
} from "../dtos/ProductResponseDto.js";

export class GetCategories {
  constructor(
    private readonly categories: ICategoryRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(locale: SupportedLocale): Promise<CategoryDto[]> {
    const key = categoriesCacheKey(locale);
    const cached = await this.cache.get<CategoryDto[]>(key);
    if (cached !== null) {
      return cached;
    }

    const rows = await this.categories.findAllActive(locale);
    const dtos = rows.map((category) => toCategoryDto(category, locale));
    await this.cache.set(key, dtos, CACHE_TTL.categories);
    return dtos;
  }
}
