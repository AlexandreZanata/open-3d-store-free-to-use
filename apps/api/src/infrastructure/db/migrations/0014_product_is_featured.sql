ALTER TABLE "products" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;
CREATE INDEX "products_is_featured_idx" ON "products" ("is_featured");
