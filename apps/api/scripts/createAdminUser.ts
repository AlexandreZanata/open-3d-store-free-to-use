/**
 * One-time production admin — ADR 001 disables ADMIN_BOOTSTRAP_* when NODE_ENV=production.
 *
 * Usage (on VPS):
 *   CREATE_ADMIN_EMAIL=you@example.com CREATE_ADMIN_PASSWORD='min-12-chars' \
 *     pnpm run db:create-admin
 */
import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { createDb } from "../src/infrastructure/db/client.js";
import { adminUsers } from "../src/infrastructure/db/schema.js";

const email = process.env.CREATE_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.CREATE_ADMIN_PASSWORD;

if (!email || !password) {
  console.error("createAdminUser: set CREATE_ADMIN_EMAIL and CREATE_ADMIN_PASSWORD");
  process.exit(1);
}

if (password.length < 12) {
  console.error("createAdminUser: password must be at least 12 characters");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL ?? "";
if (!connectionString) {
  console.error("createAdminUser: DATABASE_URL is required (use --env-file=.env)");
  process.exit(1);
}

const { db, pool } = createDb(connectionString);

try {
  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.error(`createAdminUser: admin already exists for ${email}`);
    process.exit(1);
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await db.insert(adminUsers).values({ email, passwordHash });
  console.log(`createAdminUser: created admin ${email}`);
} finally {
  await pool.end();
}
