import type {
  AdminProductListItem,
  CreateProductPayload,
} from "@print3d/shared-types";

import type { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository.js";
import type { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import {
  ResourceNotFoundError,
  SlugConflictError,
} from "../../errors/ApplicationErrors.js";
import { toAdminProductDto } from "../../dtos/AdminProductDto.js";
import type { AuditLogger } from "../../services/AuditLogger.js";
import type { CatalogCacheInvalidator } from "../../services/CatalogCacheInvalidator.js";
import { normalizeCreateProductInput } from "../../validation/adminCatalogValidation.js";

export type CreateProductInput = {
  adminId: string;
  payload: CreateProductPayload;
};

export class CreateProduct {
  constructor(
    private readonly products: IProductRepository,
    private readonly categories: ICategoryRepository,
    private readonly audit: AuditLogger,
    private readonly cacheInvalidator: CatalogCacheInvalidator,
  ) {}

  async execute(input: CreateProductInput): Promise<AdminProductListItem> {
    const payload = normalizeCreateProductInput(input.payload);

    const category = await this.categories.findByIdAdmin(payload.categoryId);
    if (category === null) {
      throw new ResourceNotFoundError("Category", payload.categoryId);
    }

    if (await this.products.existsBySlug(payload.slug)) {
      throw new SlugConflictError(payload.slug);
    }

    const product = await this.products.create(payload);

    await this.audit.log({
      adminUserId: input.adminId,
      action: "admin.product.created",
      resourceType: "product",
      resourceId: product.id,
      metadata: {},
    });
    await this.cacheInvalidator.invalidateCatalog("created", product.id);

    return toAdminProductDto(product);
  }
}
