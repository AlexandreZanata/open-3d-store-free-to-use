import { defineConfig } from "drizzle-kit";
export default defineConfig({
    schema: [
        "./src/infrastructure/db/schema.ts",
        "./src/infrastructure/db/schema.admin.ts",
        "./src/infrastructure/db/schema.store.ts",
    ],
    out: "./src/infrastructure/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL ?? "",
    },
});
//# sourceMappingURL=drizzle.config.js.map