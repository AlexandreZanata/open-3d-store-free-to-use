import { sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { products } from "./schema.catalog.js";

export const modelProcessingJobs = pgTable(
  "model_processing_jobs",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    status: text("status").notNull().default("pending"),
    sourceUrl: text("source_url").notNull(),
    sourcePath: text("source_path").notNull(),
    previewUrl: text("preview_url"),
    previewPath: text("preview_path"),
    parts: jsonb("parts").notNull().default([]),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("model_processing_jobs_status_idx").on(table.status),
    index("model_processing_jobs_created_at_idx").on(table.createdAt),
  ],
);

export const productFavorites = pgTable(
  "product_favorites",
  {
    visitorId: text("visitor_id").notNull(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("product_favorites_visitor_id_idx").on(table.visitorId),
    index("product_favorites_product_id_idx").on(table.productId),
  ],
);

export const orderCaptures = pgTable(
  "order_captures",
  {
    id: uuid("id").primaryKey(),
    items: jsonb("items").notNull(),
    customerName: text("customer_name"),
    customerNote: text("customer_note"),
    totalCents: integer("total_cents").notNull(),
    whatsappLink: text("whatsapp_link").notNull(),
    capturedAt: timestamp("captured_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("order_captures_captured_at_idx").on(table.capturedAt)],
);

export const domainEvents = pgTable(
  "domain_events",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    eventType: text("event_type").notNull(),
    aggregateId: uuid("aggregate_id"),
    payload: jsonb("payload").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("domain_events_event_type_idx").on(table.eventType),
    index("domain_events_occurred_at_idx").on(table.occurredAt),
    index("domain_events_aggregate_id_idx").on(table.aggregateId),
  ],
);
