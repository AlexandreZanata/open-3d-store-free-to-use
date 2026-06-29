import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { products } from "./schema.js";

export const storeUsers = pgTable(
  "store_users",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("store_users_email_idx").on(table.email)],
);

export const storeSessions = pgTable(
  "store_sessions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    storeUserId: uuid("store_user_id")
      .notNull()
      .references(() => storeUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => [
    index("store_sessions_store_user_id_idx").on(table.storeUserId),
    index("store_sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const storeRegistrationOrigins = pgTable(
  "store_registration_origins",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => storeUsers.id, { onDelete: "cascade" }),
    ipAddress: text("ip_address").notNull(),
    deviceId: text("device_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("store_registration_origins_ip_idx").on(table.ipAddress),
    index("store_registration_origins_device_idx").on(table.deviceId),
  ],
);

export const storeUserState = pgTable("store_user_state", {
  storeUserId: uuid("store_user_id")
    .primaryKey()
    .references(() => storeUsers.id, { onDelete: "cascade" }),
  cartItems: jsonb("cart_items").notNull().default([]),
  checkoutNote: text("checkout_note"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const storeUserFavorites = pgTable(
  "store_user_favorites",
  {
    storeUserId: uuid("store_user_id")
      .notNull()
      .references(() => storeUsers.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("store_user_favorites_user_idx").on(table.storeUserId),
  ],
);

export const storeUsersRelations = relations(storeUsers, ({ many, one }) => ({
  sessions: many(storeSessions),
  state: one(storeUserState),
  favorites: many(storeUserFavorites),
}));

export const storeSessionsRelations = relations(storeSessions, ({ one }) => ({
  user: one(storeUsers, {
    fields: [storeSessions.storeUserId],
    references: [storeUsers.id],
  }),
}));
