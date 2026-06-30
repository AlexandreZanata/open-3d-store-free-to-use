import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const materialTypeEnum = pgEnum("material_type", [
  "PLA",
  "PETG",
  "PETG_HF",
  "ABS",
  "ASA",
  "TPU",
  "NYLON",
  "RESIN",
]);

export const printStatusEnum = pgEnum("print_status", [
  "active",
  "out_of_stock",
  "discontinued",
]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    parentId: uuid("parent_id"),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    translations: jsonb("translations").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("categories_slug_idx").on(table.slug),
    index("categories_parent_id_idx").on(table.parentId),
    index("categories_sort_order_idx").on(table.sortOrder),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    shortDescription: text("short_description").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    basePrice: integer("base_price").notNull(),
    material: materialTypeEnum("material").notNull(),
    printTimeHours: integer("print_time_hours").notNull(),
    weightGrams: integer("weight_grams").notNull(),
    status: printStatusEnum("status").notNull().default("active"),
    options: jsonb("options").notNull().default([]),
    modelFileUrl: text("model_file_url"),
    modelParts: jsonb("model_parts").notNull().default([]),
    thumbnailUrl: text("thumbnail_url").notNull(),
    imageUrls: jsonb("image_urls").notNull().default([]),
    tags: jsonb("tags").notNull().default([]),
    translations: jsonb("translations").notNull().default({}),
    isFeatured: boolean("is_featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("products_slug_idx").on(table.slug),
    index("products_category_id_idx").on(table.categoryId),
    index("products_status_idx").on(table.status),
    index("products_material_idx").on(table.material),
    index("products_base_price_idx").on(table.basePrice),
    index("products_is_featured_idx").on(table.isFeatured),
  ],
);

export const shopSettings = pgTable("shop_settings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),
  singletonKey: text("singleton_key").notNull().unique().default("default"),
  whatsappPhone: text("whatsapp_phone").notNull(),
  enabledMaterials: jsonb("enabled_materials").notNull().default([]),
  offersDelivery: boolean("offers_delivery").notNull().default(false),
  pickupOnly: boolean("pickup_only").notNull().default(true),
  pickupLocation: text("pickup_location"),
  paymentMethods: jsonb("payment_methods").notNull().default([]),
  requiresDeposit: boolean("requires_deposit").notNull().default(false),
  depositPercent: integer("deposit_percent"),
  availableColors: jsonb("available_colors").notNull().default([]),
  materialPricing: jsonb("material_pricing").notNull().default({}),
  calculatorSettings: jsonb("calculator_settings")
    .notNull()
    .default({
      machineHourlyRateCents: 1500,
      handlingFeeCents: 500,
      defaultInfillFactor: 0.2,
    }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));
