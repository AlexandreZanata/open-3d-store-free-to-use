import path from "node:path";
import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const apiRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/** Apply Drizzle migrations once before integration tests (CI + local DB). */
export default async function globalSetup(): Promise<void> {
  const connectionString =
    process.env.DATABASE_URL ?? process.env.TEST_DATABASE_URL ?? "";
  if (connectionString.length === 0) {
    return;
  }

  const pool = new pg.Pool({ connectionString, max: 1 });
  try {
    const db = drizzle(pool);
    await migrate(db, {
      migrationsFolder: path.join(apiRoot, "src/infrastructure/db/migrations"),
    });
  } finally {
    await pool.end();
  }
}
