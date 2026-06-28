import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "./schema.js";

const { Pool } = pg;

export type Database = ReturnType<typeof createDb>["db"];

export function createDb(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

  const db = drizzle(pool, { schema });

  return { db, pool };
}

export { schema };
