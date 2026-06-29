import type { CatalogChangedAction, CatalogChangedEvent } from "@print3d/shared-types";
import { SUPPORTED_LOCALES } from "@print3d/shared-types";

import {
  categoriesCacheKey,
  productCacheKey,
} from "../cache/cacheKeys.js";
import type { ICatalogEventPublisher } from "../ports/ICatalogEventPublisher.js";
import type { ICacheService } from "../ports/ICacheService.js";

export class CatalogCacheInvalidator {
  constructor(
    private readonly cache: ICacheService,
    private readonly events?: ICatalogEventPublisher,
  ) {}

  async invalidateCatalog(
    action: CatalogChangedAction = "updated",
    id?: string,
  ): Promise<void> {
    await this.clearCatalogCaches();
    await this.publish({
      type: "catalog.changed",
      resource: "catalog",
      action,
      at: new Date().toISOString(),
      ...(id !== undefined ? { id } : {}),
    });
  }

  async invalidateProduct(
    slug: string,
    action: CatalogChangedAction = "updated",
    id?: string,
  ): Promise<void> {
    for (const locale of SUPPORTED_LOCALES) {
      await this.cache.del(productCacheKey(slug, locale));
    }
    await this.clearCatalogCaches();
    await this.publish({
      type: "catalog.changed",
      resource: "product",
      action,
      slug,
      at: new Date().toISOString(),
      ...(id !== undefined ? { id } : {}),
    });
  }

  private async clearCatalogCaches(): Promise<void> {
    await this.cache.deleteByPrefix("v1:products:");
    await this.cache.deleteByPrefix("v1:search:");
    for (const locale of SUPPORTED_LOCALES) {
      await this.cache.del(categoriesCacheKey(locale));
    }
  }

  private async publish(event: CatalogChangedEvent): Promise<void> {
    await this.events?.publish(event);
  }
}
