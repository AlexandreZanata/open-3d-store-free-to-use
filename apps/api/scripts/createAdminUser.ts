/**
 * Production admin user — ADR 001 disables ADMIN_BOOTSTRAP_* when NODE_ENV=production.
 *
 * Create (on VPS):
 *   CREATE_ADMIN_EMAIL=you@example.com CREATE_ADMIN_PASSWORD='min-12-chars' \
 *     pnpm run db:create-admin
 *
 * Reset password when user already exists:
 *   CREATE_ADMIN_FORCE=1 CREATE_ADMIN_EMAIL=... CREATE_ADMIN_PASSWORD='...' \
 *     pnpm run db:create-admin
 */
import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { createDb } from "../src/infrastructure/db/client.js";
import { adminUsers } from "../src/infrastructure/db/schema.js";

const email = process.env.CREATE_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.CREATE_ADMIN_PASSWORD;
const forceReset = process.env.CREATE_ADMIN_FORCE === "1";

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
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (existing.length > 0) {
    if (!forceReset) {
      console.error(`createAdminUser: admin already exists for ${email} (use CREATE_ADMIN_FORCE=1 to reset password)`);
      process.exit(1);
    }
    await db
      .update(adminUsers)
      .set({ passwordHash })
      .where(eq(adminUsers.id, existing[0]!.id));
    console.log(`createAdminUser: password reset for ${email}`);
  } else {
    await db.insert(adminUsers).values({ email, passwordHash });
    console.log(`createAdminUser: created admin ${email}`);
  }
} finally {
  await pool.end();
}
