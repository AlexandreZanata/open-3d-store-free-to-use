import type {
  IProductRepository,
  PaginatedResult,
  PaginationParams,
  ProductFilters,
} from "../../domain/repositories/IProductRepository.js";
import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type { ICacheService } from "../ports/ICacheService.js";
import {
  CACHE_TTL,
  productListCacheKey,
} from "../cache/cacheKeys.js";
import {
  toProductListItemDto,
  type ProductListItemDto,
} from "../dtos/ProductResponseDto.js";

export class ListProducts {
  constructor(
    private readonly products: IProductRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(
    filters: ProductFilters,
    pagination: PaginationParams,
    locale: SupportedLocale,
  ): Promise<PaginatedResult<ProductListItemDto>> {
    const key = productListCacheKey(filters, locale, pagination.page);
    const cached =
      await this.cache.get<PaginatedResult<ProductListItemDto>>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await this.products.findMany(filters, pagination, locale);
    const mapped: PaginatedResult<ProductListItemDto> = {
      data: result.data.map((product) => toProductListItemDto(product, locale)),
      pagination: result.pagination,
    };

    await this.cache.set(key, mapped, CACHE_TTL.productList);
    return mapped;
  }
}
