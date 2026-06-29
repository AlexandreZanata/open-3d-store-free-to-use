-- Model studio: colors, pricing calculator, async processing jobs, product parts

ALTER TABLE shop_settings
  ADD COLUMN IF NOT EXISTS available_colors jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS material_pricing jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS calculator_settings jsonb NOT NULL DEFAULT '{"machineHourlyRateCents":1500,"handlingFeeCents":500,"defaultInfillFactor":0.2}';

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS model_parts jsonb NOT NULL DEFAULT '[]';

CREATE TABLE IF NOT EXISTS model_processing_jobs (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  status text NOT NULL DEFAULT 'pending',
  source_url text NOT NULL,
  source_path text NOT NULL,
  parts jsonb NOT NULL DEFAULT '[]',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS model_processing_jobs_status_idx ON model_processing_jobs (status);
CREATE INDEX IF NOT EXISTS model_processing_jobs_created_at_idx ON model_processing_jobs (created_at);
