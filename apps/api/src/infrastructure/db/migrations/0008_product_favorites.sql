CREATE TABLE IF NOT EXISTS "product_favorites" (
  "visitor_id" text NOT NULL,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "product_favorites_pkey" PRIMARY KEY ("visitor_id", "product_id")
);

CREATE INDEX IF NOT EXISTS "product_favorites_visitor_id_idx" ON "product_favorites" ("visitor_id");
CREATE INDEX IF NOT EXISTS "product_favorites_product_id_idx" ON "product_favorites" ("product_id");
