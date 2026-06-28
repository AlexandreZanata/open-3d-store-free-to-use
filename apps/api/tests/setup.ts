import type pg from "pg";

import { createDb, type Database } from "../src/infrastructure/db/client.js";

export const testConnectionString =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "";

export function createTestDb(): ReturnType<typeof createDb> {
  if (testConnectionString.length === 0) {
    throw new Error("TEST_DATABASE_URL or DATABASE_URL is required for tests");
  }
  return createDb(testConnectionString);
}

export async function truncateCatalogTables(pool: pg.Pool): Promise<void> {
  await pool.query(
    "TRUNCATE TABLE products, order_captures, domain_events RESTART IDENTITY CASCADE",
  );
  await pool.query(
    "TRUNCATE TABLE categories RESTART IDENTITY CASCADE",
  );
}

export async function withTestDb<T>(
  fn: (db: Database, pool: pg.Pool) => Promise<T>,
): Promise<T> {
  const { db, pool } = createTestDb();
  try {
    return await fn(db, pool);
  } finally {
    await pool.end();
  }
}
