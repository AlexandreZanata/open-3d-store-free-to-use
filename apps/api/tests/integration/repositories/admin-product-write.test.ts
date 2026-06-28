/**
 * Contract: docs/api/admin-contract.md — POST /admin/products
 */
import { describe, expect, it } from "vitest";

import { DrizzleProductRepository } from "../../../src/infrastructure/repositories/DrizzleProductRepository.js";
import { DrizzleCategoryRepository } from "../../../src/infrastructure/repositories/DrizzleCategoryRepository.js";
import { seedCatalog } from "../../../scripts/seedCatalog.js";
import {
  testConnectionString,
  truncateCatalogTables,
  withTestDb,
} from "../../setup.js";
import { adminProductFixture } from "./adminFixtures.js";

const hasDatabase = testConnectionString.length > 0;

describe("DrizzleProductRepository admin writes", () => {
  it.skipIf(!hasDatabase)(
    "create returns bilingual translations per admin contract",
    async () => {
      await withTestDb(async (db, pool) => {
        await truncateCatalogTables(pool);
        await seedCatalog(testConnectionString);

        const categoryRepo = new DrizzleCategoryRepository(db);
        const categories = await categoryRepo.findAllAdmin();
        const categoryId = categories[0]?.id;
        expect(categoryId).toBeDefined();

        const repository = new DrizzleProductRepository(db);
        const created = await repository.create({
          ...adminProductFixture,
          categoryId: categoryId!,
        });

        expect(created.slug).toBe("admin-test-frame");
        expect(created.translations.en.name).toBe("Custom Photo Frame");
        expect(created.translations["pt-BR"].name).toBe(
          "Porta-retrato personalizado",
        );
        expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });
    },
  );

  it.skipIf(!hasDatabase)(
    "findManyAdmin includes discontinued products",
    async () => {
      await withTestDb(async (db, pool) => {
        await truncateCatalogTables(pool);
        await seedCatalog(testConnectionString);

        const categoryRepo = new DrizzleCategoryRepository(db);
        const categoryId = (await categoryRepo.findAllAdmin())[0]?.id;
        const repository = new DrizzleProductRepository(db);

        await repository.create({
          ...adminProductFixture,
          slug: "discontinued-item",
          categoryId: categoryId!,
          status: "discontinued",
        });

        const result = await repository.findManyAdmin(
          { status: "discontinued" },
          { page: 1, limit: 20 },
        );

        expect(result.data.some((item) => item.slug === "discontinued-item")).toBe(
          true,
        );
      });
    },
  );

  it.skipIf(!hasDatabase)("existsBySlug detects duplicates", async () => {
    await withTestDb(async (db, pool) => {
      await truncateCatalogTables(pool);
      await seedCatalog(testConnectionString);

      const repository = new DrizzleProductRepository(db);
      expect(await repository.existsBySlug("custom-photo-frame")).toBe(true);
      expect(await repository.existsBySlug("missing-slug")).toBe(false);
    });
  });
});
