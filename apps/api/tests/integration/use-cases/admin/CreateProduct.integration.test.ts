/**
 * Contract: docs/api/admin-contract.md — POST /admin/products via use case
 */
import { describe, expect, it } from "vitest";

import { AuditLogger } from "../../../../src/application/services/AuditLogger.js";
import { CatalogCacheInvalidator } from "../../../../src/application/services/CatalogCacheInvalidator.js";
import { CreateProduct } from "../../../../src/application/use-cases/admin/CreateProduct.js";
import { DrizzleCategoryRepository } from "../../../../src/infrastructure/repositories/DrizzleCategoryRepository.js";
import { DrizzleProductRepository } from "../../../../src/infrastructure/repositories/DrizzleProductRepository.js";
import { seedCatalog } from "../../../../scripts/seedCatalog.js";
import {
  testConnectionString,
  truncateCatalogTables,
  withTestDb,
} from "../../../setup.js";
import { adminProductFixture } from "../../repositories/adminFixtures.js";
import { createMockCache } from "../../../unit/application/testHelpers.js";
import { createMockAuditLogRepository } from "../../../unit/application/admin/adminTestHelpers.js";

const hasDatabase = testConnectionString.length > 0;

describe("CreateProduct use case integration", () => {
  it.skipIf(!hasDatabase)(
    "persists bilingual product through repository layer",
    async () => {
      await withTestDb(async (db, pool) => {
        await truncateCatalogTables(pool);
        await seedCatalog(testConnectionString);

        const categoryRepo = new DrizzleCategoryRepository(db);
        const categoryId = (await categoryRepo.findAllAdmin())[0]?.id;
        expect(categoryId).toBeDefined();

        const useCase = new CreateProduct(
          new DrizzleProductRepository(db),
          categoryRepo,
          new AuditLogger(createMockAuditLogRepository()),
          new CatalogCacheInvalidator(createMockCache()),
        );

        const created = await useCase.execute({
          adminId: "01935abc-def0-7890-abcd-ef1234567891",
          payload: { ...adminProductFixture, categoryId: categoryId! },
        });

        expect(created.slug).toBe("admin-test-frame");
        expect(created.translations.en.name).toBe("Custom Photo Frame");

        const loaded = await new DrizzleProductRepository(db).findByIdAdmin(
          created.id,
        );
        expect(loaded?.slug).toBe("admin-test-frame");
      });
    },
  );
});
