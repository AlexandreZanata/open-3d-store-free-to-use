ALTER TABLE "products" ADD COLUMN "search_vector" tsvector;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "products_search_vector_update"() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'portuguese',
    coalesce(NEW.name, '') || ' ' || coalesce(NEW.short_description, '') || ' ' || coalesce(NEW.material::text, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER "products_search_vector_trigger"
BEFORE INSERT OR UPDATE OF "name", "short_description", "material" ON "products"
FOR EACH ROW EXECUTE FUNCTION "products_search_vector_update"();
--> statement-breakpoint
CREATE INDEX "products_search_vector_idx" ON "products" USING gin ("search_vector");
