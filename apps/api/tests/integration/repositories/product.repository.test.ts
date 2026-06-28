import { describe, expect, it } from "vitest";

import { DrizzleProductRepository } from "../../../src/infrastructure/repositories/DrizzleProductRepository.js";
import { seedCatalog } from "../../../scripts/seedCatalog.js";
import {
  testConnectionString,
  truncateCatalogTables,
  withTestDb,
} from "../../setup.js";

const hasDatabase = testConnectionString.length > 0;

describe("DrizzleProductRepository (integration)", () => {
  it.skipIf(!hasDatabase)(
    "findBySlug returns localized name per i18n contract",
    async () => {
      await withTestDb(async (db, pool) => {
        await truncateCatalogTables(pool);
        await seedCatalog(testConnectionString);

        const repository = new DrizzleProductRepository(db);
        const en = await repository.findBySlug("custom-photo-frame", "en");
        const pt = await repository.findBySlug("custom-photo-frame", "pt-BR");

        expect(en?.name).toBe("Custom Photo Frame");
        expect(pt?.name).toBe("Porta-retrato personalizado");
      });
    },
  );

  it.skipIf(!hasDatabase)(
    "search returns English hits for English query",
    async () => {
      await withTestDb(async (db, pool) => {
        await truncateCatalogTables(pool);
        await seedCatalog(testConnectionString);

        const repository = new DrizzleProductRepository(db);
        const result = await repository.search(
          "photo frame",
          { page: 1, limit: 20 },
          "en",
        );

        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0]?.slug).toBe("custom-photo-frame");
      });
    },
  );

  it.skipIf(!hasDatabase)(
    "search returns Portuguese hits for Portuguese query",
    async () => {
      await withTestDb(async (db, pool) => {
        await truncateCatalogTables(pool);
        await seedCatalog(testConnectionString);

        const repository = new DrizzleProductRepository(db);
        const result = await repository.search(
          "retrato",
          { page: 1, limit: 20 },
          "pt-BR",
        );

        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0]?.slug).toBe("custom-photo-frame");
      });
    },
  );

  it.skipIf(!hasDatabase)(
    "findMany caps page size at 50 per API contract",
    async () => {
      await withTestDb(async (db, pool) => {
        await truncateCatalogTables(pool);
        await seedCatalog(testConnectionString);

        const repository = new DrizzleProductRepository(db);
        const result = await repository.findMany(
          {},
          { page: 1, limit: 100 },
          "en",
        );

        expect(result.pagination.limit).toBe(50);
      });
    },
  );
});
