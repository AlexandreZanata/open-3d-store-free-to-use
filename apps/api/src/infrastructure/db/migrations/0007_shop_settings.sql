ALTER TYPE "material_type" ADD VALUE IF NOT EXISTS 'PETG_HF';
--> statement-breakpoint
ALTER TYPE "material_type" ADD VALUE IF NOT EXISTS 'ASA';
--> statement-breakpoint
ALTER TYPE "material_type" ADD VALUE IF NOT EXISTS 'NYLON';
--> statement-breakpoint
CREATE TABLE "shop_settings" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"singleton_key" text DEFAULT 'default' NOT NULL,
	"whatsapp_phone" text NOT NULL,
	"enabled_materials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"offers_delivery" boolean DEFAULT false NOT NULL,
	"pickup_only" boolean DEFAULT true NOT NULL,
	"pickup_location" text,
	"payment_methods" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"requires_deposit" boolean DEFAULT false NOT NULL,
	"deposit_percent" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_settings_singleton_key_unique" UNIQUE("singleton_key")
);
