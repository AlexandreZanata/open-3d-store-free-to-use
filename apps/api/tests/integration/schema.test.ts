import pg from "pg";
import { describe, expect, it } from "vitest";

const connectionString =
  process.env.DATABASE_URL ?? process.env.TEST_DATABASE_URL ?? "";

const requiredTables = [
  "categories",
  "products",
  "order_captures",
  "domain_events",
];

describe("database schema (integration)", () => {
  it.skipIf(connectionString.length === 0)(
    "creates all catalog tables",
    async () => {
      const client = new pg.Client({ connectionString });
      await client.connect();

      const result = await client.query<{ table_name: string }>(
        `SELECT table_name
         FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_type = 'BASE TABLE'
         ORDER BY table_name`,
      );

      const tables = result.rows.map((row) => row.table_name);
      for (const name of requiredTables) {
        expect(tables).toContain(name);
      }

      await client.end();
    },
  );

  it.skipIf(connectionString.length === 0)(
    "products has search_vector column and GIN index",
    async () => {
      const client = new pg.Client({ connectionString });
      await client.connect();

      const column = await client.query(
        `SELECT column_name, data_type
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'products'
           AND column_name = 'search_vector'`,
      );
      expect(column.rows).toHaveLength(1);
      expect(column.rows[0]?.data_type).toBe("tsvector");

      const index = await client.query(
        `SELECT indexname
         FROM pg_indexes
         WHERE schemaname = 'public'
           AND tablename = 'products'
           AND indexname = 'products_search_vector_idx'`,
      );
      expect(index.rows).toHaveLength(1);

      await client.end();
    },
  );

  it.skipIf(connectionString.length === 0)(
    "uuidv7() generates primary keys",
    async () => {
      const client = new pg.Client({ connectionString });
      await client.connect();

      const result = await client.query<{ uuidv7: string }>(
        "SELECT uuidv7() AS uuidv7",
      );
      expect(result.rows[0]?.uuidv7).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );

      await client.end();
    },
  );
});
