import type {
  AdminCategoryListItem,
  AdminCategoryListResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@print3d/shared-types";

import type { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository.js";
import {
  CategoryHasActiveProductsError,
  ResourceNotFoundError,
  SlugConflictError,
  ValidationError,
} from "../../errors/ApplicationErrors.js";
import { toAdminCategoryDto } from "../../dtos/AdminCategoryDto.js";
import type { AuditLogger } from "../../services/AuditLogger.js";
import type { CatalogCacheInvalidator } from "../../services/CatalogCacheInvalidator.js";
import {
  normalizeCreateCategoryInput,
  normalizeUpdateCategoryInput,
} from "../../validation/adminCatalogValidation.js";

async function assertParentDepth(
  categories: ICategoryRepository,
  parentId: string | null,
): Promise<void> {
  if (parentId === null) {
    return;
  }
  const parent = await categories.findByIdAdmin(parentId);
  if (parent === null) {
    throw new ResourceNotFoundError("Category", parentId);
  }
  if (parent.parentId !== null) {
    throw new ValidationError("Categories support at most one nesting level");
  }
}

function assertSortOrder(sortOrder: number): void {
  if (!Number.isInteger(sortOrder)) {
    throw new ValidationError("sortOrder must be an integer");
  }
}

export type CreateCategoryInput = {
  adminId: string;
  payload: CreateCategoryPayload;
};

export class CreateCategory {
  constructor(
    private readonly categories: ICategoryRepository,
    private readonly audit: AuditLogger,
    private readonly cacheInvalidator: CatalogCacheInvalidator,
  ) {}

  async execute(input: CreateCategoryInput): Promise<AdminCategoryListItem> {
    const payload = normalizeCreateCategoryInput(input.payload);
    assertSortOrder(payload.sortOrder);
    await assertParentDepth(this.categories, payload.parentId);

    if (await this.categories.existsBySlug(payload.slug)) {
      throw new SlugConflictError(payload.slug);
    }

    const category = await this.categories.create(payload);

    await this.audit.log({
      adminUserId: input.adminId,
      action: "admin.category.created",
      resourceType: "category",
      resourceId: category.id,
      metadata: {},
    });
    await this.cacheInvalidator.invalidateCatalog();

    return toAdminCategoryDto(category);
  }
}

export type UpdateCategoryInput = {
  adminId: string;
  categoryId: string;
  payload: UpdateCategoryPayload;
};

export class UpdateCategory {
  constructor(
    private readonly categories: ICategoryRepository,
    private readonly audit: AuditLogger,
    private readonly cacheInvalidator: CatalogCacheInvalidator,
  ) {}

  async execute(input: UpdateCategoryInput): Promise<AdminCategoryListItem> {
    const existing = await this.categories.findByIdAdmin(input.categoryId);
    if (existing === null) {
      throw new ResourceNotFoundError("Category", input.categoryId);
    }

    const payload = normalizeUpdateCategoryInput(input.payload);
    if (payload.sortOrder !== undefined) {
      assertSortOrder(payload.sortOrder);
    }
    if (payload.parentId !== undefined) {
      if (payload.parentId === existing.id) {
        throw new ValidationError("Category cannot be its own parent");
      }
      await assertParentDepth(this.categories, payload.parentId);
    }

    if (payload.slug !== undefined && payload.slug !== existing.slug) {
      if (await this.categories.existsBySlug(payload.slug, existing.id)) {
        throw new SlugConflictError(payload.slug);
      }
    }

    const category = await this.categories.update(existing.id, payload);

    await this.audit.log({
      adminUserId: input.adminId,
      action: "admin.category.updated",
      resourceType: "category",
      resourceId: category.id,
      metadata: {},
    });
    await this.cacheInvalidator.invalidateCatalog();

    return toAdminCategoryDto(category);
  }
}

export type DeleteCategoryInput = {
  adminId: string;
  categoryId: string;
};

export class DeleteCategory {
  constructor(
    private readonly categories: ICategoryRepository,
    private readonly audit: AuditLogger,
    private readonly cacheInvalidator: CatalogCacheInvalidator,
  ) {}

  async execute(input: DeleteCategoryInput): Promise<void> {
    const existing = await this.categories.findByIdAdmin(input.categoryId);
    if (existing === null) {
      throw new ResourceNotFoundError("Category", input.categoryId);
    }

    const activeProducts = await this.categories.countActiveProducts(existing.id);
    if (activeProducts > 0) {
      throw new CategoryHasActiveProductsError(existing.id);
    }

    await this.categories.deactivate(existing.id);

    await this.audit.log({
      adminUserId: input.adminId,
      action: "admin.category.deleted",
      resourceType: "category",
      resourceId: existing.id,
      metadata: {},
    });
    await this.cacheInvalidator.invalidateCatalog();
  }
}

export class ListCategoriesAdmin {
  constructor(private readonly categories: ICategoryRepository) {}

  async execute(): Promise<AdminCategoryListResponse> {
    const data = await this.categories.findAllAdmin();
    return { data: data.map((item) => toAdminCategoryDto(item)) };
  }
}

export type GetCategoryAdminInput = {
  categoryId: string;
};

export class GetCategoryAdmin {
  constructor(private readonly categories: ICategoryRepository) {}

  async execute(input: GetCategoryAdminInput): Promise<AdminCategoryListItem> {
    const category = await this.categories.findByIdAdmin(input.categoryId);
    if (category === null) {
      throw new ResourceNotFoundError("Category", input.categoryId);
    }
    return toAdminCategoryDto(category);
  }
}
