import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { createDb } from "../src/infrastructure/db/client.js";
import { adminUsers } from "../src/infrastructure/db/schema.js";

export async function seedAdminUser(connectionString: string): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) {
    return;
  }

  const { db, pool } = createDb(connectionString);
  try {
    const existing = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    if (existing.length > 0) {
      return;
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await db.insert(adminUsers).values({
      email,
      passwordHash,
    });
  } finally {
    await pool.end();
  }
}
