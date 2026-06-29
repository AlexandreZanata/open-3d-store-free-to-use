ALTER TABLE model_processing_jobs
  ADD COLUMN IF NOT EXISTS preview_url text,
  ADD COLUMN IF NOT EXISTS preview_path text;
