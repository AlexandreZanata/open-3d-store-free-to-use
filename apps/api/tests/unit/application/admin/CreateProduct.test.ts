import { describe, expect, it, vi } from "vitest";

import { AuditLogger } from "../../../../src/application/services/AuditLogger.js";
import { CatalogCacheInvalidator } from "../../../../src/application/services/CatalogCacheInvalidator.js";
import { CreateProduct } from "../../../../src/application/use-cases/admin/CreateProduct.js";
import {
  ResourceNotFoundError,
  SlugConflictError,
} from "../../../../src/application/errors/ApplicationErrors.js";
import { adminProductFixture } from "../../../integration/repositories/adminFixtures.js";
import { createMockCache } from "../testHelpers.js";
import {
  createMockAuditLogRepository,
  createMockCategoryRepository,
  createMockProductRepositoryAdmin,
  sampleAdminProduct,
} from "./adminTestHelpers.js";

describe("CreateProduct", () => {
  it("creates product, audits, and invalidates catalog cache", async () => {
    const categoryId = sampleAdminProduct.categoryId;
    const categories = createMockCategoryRepository({
      findByIdAdmin: vi.fn(async () => ({
        id: categoryId,
        slug: "gifts",
        parentId: null,
        imageUrl: null,
        sortOrder: 1,
        isActive: true,
        translations: sampleAdminProduct.translations,
        createdAt: sampleAdminProduct.createdAt,
        updatedAt: sampleAdminProduct.updatedAt,
      })),
    });
    const products = createMockProductRepositoryAdmin({
      existsBySlug: vi.fn(async () => false),
      create: vi.fn(async () => sampleAdminProduct),
    });
    const cache = createMockCache({ "v1:products:en:page:1": {} });
    const cacheInvalidator = new CatalogCacheInvalidator(cache);
    const auditLogs = createMockAuditLogRepository();
    const useCase = new CreateProduct(
      products,
      categories,
      new AuditLogger(auditLogs),
      cacheInvalidator,
    );

    const result = await useCase.execute({
      adminId: "admin-id",
      payload: { ...adminProductFixture, categoryId },
    });

    expect(result.id).toBe(sampleAdminProduct.id);
    expect(auditLogs.append).toHaveBeenCalledWith(
      expect.objectContaining({ action: "admin.product.created" }),
    );
    expect(cache.deleteByPrefix).toHaveBeenCalled();
  });

  it("throws when category is missing", async () => {
    const useCase = new CreateProduct(
      createMockProductRepositoryAdmin(),
      createMockCategoryRepository({
        findByIdAdmin: vi.fn(async () => null),
      }),
      new AuditLogger(createMockAuditLogRepository()),
      new CatalogCacheInvalidator(createMockCache()),
    );

    await expect(
      useCase.execute({
        adminId: "admin-id",
        payload: adminProductFixture,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("throws on slug conflict", async () => {
    const useCase = new CreateProduct(
      createMockProductRepositoryAdmin({
        existsBySlug: vi.fn(async () => true),
      }),
      createMockCategoryRepository({
        findByIdAdmin: vi.fn(async () => ({
          id: adminProductFixture.categoryId,
          slug: "gifts",
          parentId: null,
          imageUrl: null,
          sortOrder: 1,
          isActive: true,
          translations: sampleAdminProduct.translations,
          createdAt: sampleAdminProduct.createdAt,
          updatedAt: sampleAdminProduct.updatedAt,
        })),
      }),
      new AuditLogger(createMockAuditLogRepository()),
      new CatalogCacheInvalidator(createMockCache()),
    );

    await expect(
      useCase.execute({
        adminId: "admin-id",
        payload: { ...adminProductFixture, categoryId: sampleAdminProduct.categoryId },
      }),
    ).rejects.toBeInstanceOf(SlugConflictError);
  });
});
