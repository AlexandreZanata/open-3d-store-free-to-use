import { SUPPORTED_LOCALES } from "@print3d/shared-types";

import {
  categoriesCacheKey,
  productCacheKey,
} from "../cache/cacheKeys.js";
import type { ICacheService } from "../ports/ICacheService.js";

export class CatalogCacheInvalidator {
  constructor(private readonly cache: ICacheService) {}

  async invalidateCatalog(): Promise<void> {
    await this.cache.deleteByPrefix("v1:products:");
    await this.cache.deleteByPrefix("v1:search:");
    for (const locale of SUPPORTED_LOCALES) {
      await this.cache.del(categoriesCacheKey(locale));
    }
  }

  async invalidateProduct(slug: string): Promise<void> {
    for (const locale of SUPPORTED_LOCALES) {
      await this.cache.del(productCacheKey(slug, locale));
    }
    await this.invalidateCatalog();
  }
}
