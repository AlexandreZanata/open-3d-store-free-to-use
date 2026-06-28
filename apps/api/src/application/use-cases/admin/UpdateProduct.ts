import type {
  AdminProductListItem,
  UpdateProductPayload,
} from "@print3d/shared-types";

import { assertProductStatusTransition } from "../../../domain/services/ProductStatusMachine.js";
import type { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import {
  ResourceNotFoundError,
  SlugConflictError,
} from "../../errors/ApplicationErrors.js";
import { toAdminProductDto } from "../../dtos/AdminProductDto.js";
import type { AuditLogger } from "../../services/AuditLogger.js";
import type { CatalogCacheInvalidator } from "../../services/CatalogCacheInvalidator.js";
import { normalizeUpdateProductInput } from "../../validation/adminCatalogValidation.js";

export type UpdateProductInput = {
  adminId: string;
  productId: string;
  payload: UpdateProductPayload;
};

export class UpdateProduct {
  constructor(
    private readonly products: IProductRepository,
    private readonly categories: ICategoryRepository,
    private readonly audit: AuditLogger,
    private readonly cacheInvalidator: CatalogCacheInvalidator,
  ) {}

  async execute(input: UpdateProductInput): Promise<AdminProductListItem> {
    const existing = await this.products.findByIdAdmin(input.productId);
    if (existing === null) {
      throw new ResourceNotFoundError("Product", input.productId);
    }

    const payload = normalizeUpdateProductInput(input.payload);

    if (payload.categoryId !== undefined) {
      const category = await this.categories.findByIdAdmin(payload.categoryId);
      if (category === null) {
        throw new ResourceNotFoundError("Category", payload.categoryId);
      }
    }

    if (payload.slug !== undefined && payload.slug !== existing.slug) {
      if (await this.products.existsBySlug(payload.slug, existing.id)) {
        throw new SlugConflictError(payload.slug);
      }
    }

    if (payload.status !== undefined) {
      assertProductStatusTransition(existing.status, payload.status);
    }

    const product = await this.products.update(existing.id, payload);

    await this.audit.log({
      adminUserId: input.adminId,
      action: "admin.product.updated",
      resourceType: "product",
      resourceId: product.id,
      metadata: {},
    });
    await this.cacheInvalidator.invalidateProduct(existing.slug);
    if (product.slug !== existing.slug) {
      await this.cacheInvalidator.invalidateProduct(product.slug);
    }

    return toAdminProductDto(product);
  }
}
