ALTER TABLE "categories" ADD COLUMN "translations" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "translations" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
UPDATE "categories" SET "translations" = jsonb_build_object(
  'en', jsonb_build_object('name', "name", 'description', coalesce("description", '')),
  'pt-BR', jsonb_build_object('name', "name", 'description', coalesce("description", ''))
) WHERE "translations" = '{}'::jsonb;
--> statement-breakpoint
UPDATE "products" SET "translations" = jsonb_build_object(
  'en', jsonb_build_object(
    'name', "name",
    'description', "description",
    'shortDescription', "short_description"
  ),
  'pt-BR', jsonb_build_object(
    'name', "name",
    'description', "description",
    'shortDescription', "short_description"
  )
) WHERE "translations" = '{}'::jsonb;
--> statement-breakpoint
DROP TRIGGER IF EXISTS "products_search_vector_trigger" ON "products";
--> statement-breakpoint
DROP FUNCTION IF EXISTS "products_search_vector_update"();
--> statement-breakpoint
DROP INDEX IF EXISTS "products_search_vector_idx";
--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN IF EXISTS "search_vector";
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "search_vector_en" tsvector;
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "search_vector_pt" tsvector;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "products_search_vectors_update"() RETURNS trigger AS $$
BEGIN
  NEW.search_vector_en := to_tsvector(
    'english',
    coalesce(NEW.translations->'en'->>'name', '') || ' ' ||
    coalesce(NEW.translations->'en'->>'shortDescription', '') || ' ' ||
    coalesce(NEW.material::text, '')
  );
  NEW.search_vector_pt := to_tsvector(
    'portuguese',
    coalesce(NEW.translations->'pt-BR'->>'name', '') || ' ' ||
    coalesce(NEW.translations->'pt-BR'->>'shortDescription', '') || ' ' ||
    coalesce(NEW.material::text, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER "products_search_vectors_trigger"
BEFORE INSERT OR UPDATE OF "translations", "material" ON "products"
FOR EACH ROW EXECUTE FUNCTION "products_search_vectors_update"();
--> statement-breakpoint
UPDATE "products" SET "material" = "material";
--> statement-breakpoint
CREATE INDEX "products_search_vector_en_idx" ON "products" USING gin ("search_vector_en");
--> statement-breakpoint
CREATE INDEX "products_search_vector_pt_idx" ON "products" USING gin ("search_vector_pt");
