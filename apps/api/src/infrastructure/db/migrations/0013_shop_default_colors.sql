-- Backfill empty shop color palette with default filament presets.
UPDATE shop_settings
SET available_colors = '[
  {"id":"pla-white","name":"White","hex":"#F5F5F5"},
  {"id":"pla-black","name":"Black","hex":"#1A1A1A"},
  {"id":"pla-red","name":"Red","hex":"#C62828"},
  {"id":"pla-blue","name":"Blue","hex":"#1565C0"},
  {"id":"pla-green","name":"Green","hex":"#2E7D32"}
]'::jsonb
WHERE jsonb_array_length(available_colors) = 0;
