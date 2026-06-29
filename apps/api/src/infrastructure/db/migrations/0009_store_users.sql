CREATE TABLE IF NOT EXISTS "store_users" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
  "email" text NOT NULL,
  "password_hash" text NOT NULL,
  "display_name" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "store_users_email_unique" UNIQUE("email")
);

CREATE INDEX IF NOT EXISTS "store_users_email_idx" ON "store_users" ("email");

CREATE TABLE IF NOT EXISTS "store_sessions" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
  "store_user_id" uuid NOT NULL REFERENCES "store_users"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "ip_address" text,
  "user_agent" text,
  CONSTRAINT "store_sessions_token_hash_unique" UNIQUE("token_hash")
);

CREATE INDEX IF NOT EXISTS "store_sessions_store_user_id_idx" ON "store_sessions" ("store_user_id");
CREATE INDEX IF NOT EXISTS "store_sessions_expires_at_idx" ON "store_sessions" ("expires_at");

CREATE TABLE IF NOT EXISTS "store_registration_origins" (
  "user_id" uuid PRIMARY KEY REFERENCES "store_users"("id") ON DELETE CASCADE,
  "ip_address" text NOT NULL,
  "device_id" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "store_registration_origins_ip_idx" ON "store_registration_origins" ("ip_address");
CREATE INDEX IF NOT EXISTS "store_registration_origins_device_idx" ON "store_registration_origins" ("device_id");

CREATE TABLE IF NOT EXISTS "store_user_state" (
  "store_user_id" uuid PRIMARY KEY REFERENCES "store_users"("id") ON DELETE CASCADE,
  "cart_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "store_user_favorites" (
  "store_user_id" uuid NOT NULL REFERENCES "store_users"("id") ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "store_user_favorites_pkey" PRIMARY KEY ("store_user_id", "product_id")
);

CREATE INDEX IF NOT EXISTS "store_user_favorites_user_idx" ON "store_user_favorites" ("store_user_id");
