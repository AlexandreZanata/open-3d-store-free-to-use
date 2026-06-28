CREATE TYPE "public"."material_type" AS ENUM('PLA', 'PETG', 'ABS', 'TPU', 'RESIN');--> statement-breakpoint
CREATE TYPE "public"."print_status" AS ENUM('active', 'out_of_stock', 'discontinued');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "domain_events" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"event_type" text NOT NULL,
	"aggregate_id" uuid,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_captures" (
	"id" uuid PRIMARY KEY NOT NULL,
	"items" jsonb NOT NULL,
	"customer_name" text,
	"customer_note" text,
	"total_cents" integer NOT NULL,
	"whatsapp_link" text NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"short_description" text NOT NULL,
	"category_id" uuid NOT NULL,
	"base_price" integer NOT NULL,
	"material" "material_type" NOT NULL,
	"print_time_hours" integer NOT NULL,
	"weight_grams" integer NOT NULL,
	"status" "print_status" DEFAULT 'active' NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model_file_url" text,
	"thumbnail_url" text NOT NULL,
	"image_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_id_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "categories_sort_order_idx" ON "categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "domain_events_event_type_idx" ON "domain_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "domain_events_occurred_at_idx" ON "domain_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "domain_events_aggregate_id_idx" ON "domain_events" USING btree ("aggregate_id");--> statement-breakpoint
CREATE INDEX "order_captures_captured_at_idx" ON "order_captures" USING btree ("captured_at");--> statement-breakpoint
CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_material_idx" ON "products" USING btree ("material");--> statement-breakpoint
CREATE INDEX "products_base_price_idx" ON "products" USING btree ("base_price");