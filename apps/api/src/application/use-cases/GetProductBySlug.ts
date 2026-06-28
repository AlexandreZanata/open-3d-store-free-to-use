import type { IProductRepository } from "../../domain/repositories/IProductRepository.js";
import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type { ICacheService } from "../ports/ICacheService.js";
import {
  CACHE_TTL,
  productCacheKey,
} from "../cache/cacheKeys.js";
import {
  toProductDetailDto,
  type ProductDetailDto,
} from "../dtos/ProductResponseDto.js";

export class GetProductBySlug {
  constructor(
    private readonly products: IProductRepository,
    private readonly cache: ICacheService,
  ) {}

  async execute(
    slug: string,
    locale: SupportedLocale,
  ): Promise<ProductDetailDto | null> {
    const key = productCacheKey(slug, locale);
    const cached = await this.cache.get<ProductDetailDto>(key);
    if (cached !== null) {
      return cached;
    }

    const product = await this.products.findBySlug(slug, locale);
    if (product === null) {
      return null;
    }

    const dto = toProductDetailDto(product, locale);
    await this.cache.set(key, dto, CACHE_TTL.productDetail);
    return dto;
  }
}
