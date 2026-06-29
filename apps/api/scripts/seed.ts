import { seedCatalog } from "./seedCatalog.js";
import { seedAdminUser } from "./seedAdmin.js";
import { seedAssets } from "./seedAssets.js";

const connectionString =
  process.env.DATABASE_URL ?? process.env.TEST_DATABASE_URL ?? "";

if (connectionString.length === 0) {
  console.error("DATABASE_URL or TEST_DATABASE_URL is required.");
  process.exit(1);
}

await seedAssets(process.env);
await seedCatalog(connectionString);
await seedAdminUser(connectionString);
console.log("Seed completed successfully (catalog, assets, admin).");
