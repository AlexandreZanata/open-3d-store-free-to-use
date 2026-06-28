import { eq } from "drizzle-orm";

import { createDb } from "../src/infrastructure/db/client.js";
import { categories, products } from "../src/infrastructure/db/schema.js";
import { seedCategories } from "./seedCategories.js";
import { seedProducts } from "./seedProducts.js";

export async function seedCatalog(connectionString: string): Promise<void> {
  const { db, pool } = createDb(connectionString);

  try {
    const categoryIds = new Map<string, string>();

    for (const item of seedCategories) {
      const inserted = await db
        .insert(categories)
        .values({
          slug: item.slug,
          name: item.name,
          description: item.description,
          sortOrder: item.sortOrder,
          imageUrl: item.imageUrl,
          translations: item.translations,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: categories.slug,
          set: {
            name: item.name,
            description: item.description,
            sortOrder: item.sortOrder,
            imageUrl: item.imageUrl,
            translations: item.translations,
            isActive: true,
            updatedAt: new Date(),
          },
        })
        .returning({ id: categories.id, slug: categories.slug });

      const row = inserted[0];
      if (row) {
        categoryIds.set(row.slug, row.id);
      }
    }

    for (const item of seedProducts) {
      let categoryId = categoryIds.get(item.categorySlug);
      if (!categoryId) {
        const existing = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.slug, item.categorySlug))
          .limit(1);
        categoryId = existing[0]?.id;
      }
      if (!categoryId) {
        throw new Error(`Missing category for product: ${item.slug}`);
      }

      await db
        .insert(products)
        .values({
          slug: item.slug,
          name: item.name,
          description: item.description,
          shortDescription: item.shortDescription,
          categoryId,
          basePrice: item.basePrice,
          material: item.material,
          printTimeHours: item.printTimeHours,
          weightGrams: item.weightGrams,
          status: item.status,
          modelFileUrl: item.modelFileUrl,
          thumbnailUrl: item.thumbnailUrl,
          imageUrls: item.imageUrls,
          tags: item.tags,
          translations: item.translations,
          options: [],
        })
        .onConflictDoUpdate({
          target: products.slug,
          set: {
            name: item.name,
            description: item.description,
            shortDescription: item.shortDescription,
            categoryId,
            basePrice: item.basePrice,
            material: item.material,
            printTimeHours: item.printTimeHours,
            weightGrams: item.weightGrams,
            status: item.status,
            modelFileUrl: item.modelFileUrl,
            thumbnailUrl: item.thumbnailUrl,
            imageUrls: item.imageUrls,
            tags: item.tags,
            translations: item.translations,
            updatedAt: new Date(),
          },
        });
    }
  } finally {
    await pool.end();
  }
}
