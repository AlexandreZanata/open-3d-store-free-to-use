/**
 * Contract: docs/api/admin-contract.md — POST /admin/categories
 */
import { describe, expect, it } from "vitest";

import { DrizzleCategoryRepository } from "../../../src/infrastructure/repositories/DrizzleCategoryRepository.js";
import { seedCatalog } from "../../../scripts/seedCatalog.js";
import {
  testConnectionString,
  truncateCatalogTables,
  withTestDb,
} from "../../setup.js";

const hasDatabase = testConnectionString.length > 0;

describe("DrizzleCategoryRepository admin writes", () => {
  it.skipIf(!hasDatabase)(
    "create returns bilingual translations per admin contract",
    async () => {
      await withTestDb(async (db, pool) => {
        await truncateCatalogTables(pool);

        const repository = new DrizzleCategoryRepository(db);
        const created = await repository.create({
          slug: "admin-test-category",
          parentId: null,
          imageUrl: "/models/thumbnails/admin-cat.webp",
          sortOrder: 99,
          isActive: true,
          translations: {
            en: { name: "Test Category", description: "Admin test category" },
            "pt-BR": {
              name: "Categoria teste",
              description: "Categoria de teste admin",
            },
          },
        });

        expect(created.slug).toBe("admin-test-category");
        expect(created.translations.en.name).toBe("Test Category");
        expect(created.isActive).toBe(true);
      });
    },
  );

  it.skipIf(!hasDatabase)("deactivate soft-deletes category", async () => {
    await withTestDb(async (db, pool) => {
      await truncateCatalogTables(pool);
      await seedCatalog(testConnectionString);

      const repository = new DrizzleCategoryRepository(db);
      const category = (await repository.findAllAdmin())[0];
      expect(category).toBeDefined();

      await repository.deactivate(category!.id);
      const updated = await repository.findByIdAdmin(category!.id);
      expect(updated?.isActive).toBe(false);
    });
  });

  it.skipIf(!hasDatabase)("findAllAdmin returns seeded and created categories", async () => {
    await withTestDb(async (db, pool) => {
      await truncateCatalogTables(pool);
      await seedCatalog(testConnectionString);

      const repository = new DrizzleCategoryRepository(db);
      const all = await repository.findAllAdmin();

      expect(all.some((item) => item.slug === "miniatures")).toBe(true);
    });
  });
});
