import type {
  IProductRepository,
  PaginatedResult,
  PaginationParams,
} from "../../domain/repositories/IProductRepository.js";
import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type { ICacheService } from "../ports/ICacheService.js";
import { CACHE_TTL, searchCacheKey } from "../cache/cacheKeys.js";
import {
  toProductListItemDto,
  type ProductListItemDto,
} from "../dtos/ProductResponseDto.js";

export class SearchProducts {
  constructor(
    private readonly products: IProductRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(
    query: string,
    pagination: PaginationParams,
    locale: SupportedLocale,
  ): Promise<PaginatedResult<ProductListItemDto>> {
    const key = searchCacheKey(query, pagination.page, locale);
    const cached =
      await this.cache.get<PaginatedResult<ProductListItemDto>>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await this.products.search(query, pagination, locale);
    const mapped: PaginatedResult<ProductListItemDto> = {
      data: result.data.map((product) => toProductListItemDto(product, locale)),
      pagination: result.pagination,
    };

    await this.cache.set(key, mapped, CACHE_TTL.search);
    return mapped;
  }
}
