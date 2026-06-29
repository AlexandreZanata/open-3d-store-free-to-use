import { eq, sql } from "drizzle-orm";

import type { MaterialType, ModelPart } from "@print3d/shared-types";

import type { Database } from "../db/client.js";
import { products } from "../db/schema.js";

export type BulkPrepriceProductRow = {
  id: string;
  material: MaterialType;
  printTimeHours: number;
  modelParts: ModelPart[];
};

export async function listProductsForBulkPreprice(
  db: Database,
): Promise<BulkPrepriceProductRow[]> {
  const rows = await db
    .select({
      id: products.id,
      material: products.material,
      printTimeHours: products.printTimeHours,
      modelParts: products.modelParts,
    })
    .from(products)
    .where(sql`jsonb_array_length(${products.modelParts}) > 0`);

  return rows.map((row) => ({
    id: row.id,
    material: row.material,
    printTimeHours: row.printTimeHours,
    modelParts: row.modelParts as ModelPart[],
  }));
}

export async function updateProductPreprice(
  db: Database,
  id: string,
  basePrice: number,
  weightGrams: number,
): Promise<void> {
  await db
    .update(products)
    .set({ basePrice, weightGrams, updatedAt: new Date() })
    .where(eq(products.id, id));
}
