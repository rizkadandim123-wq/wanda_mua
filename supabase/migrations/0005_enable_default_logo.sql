-- =============================================================================
-- 0005_enable_default_logo.sql
-- Mengaktifkan tampilan logo + teks secara default agar logo bawaan (/logo.svg)
-- tampil otomatis pada header & footer sampai admin mengubahnya di CMS.
-- =============================================================================

ALTER TABLE public.site_settings
  ALTER COLUMN brand_display_mode SET DEFAULT 'both';

UPDATE public.site_settings
SET brand_display_mode = 'both'
WHERE id = 1
  AND brand_display_mode = 'text'
  AND logo_media_id IS NULL;

UPDATE public.published_releases
SET snapshot = jsonb_set(snapshot, '{settings,brand_display_mode}', '"both"'::jsonb)
WHERE is_current = true
  AND snapshot #>> '{settings,brand_display_mode}' = 'text'
  AND (snapshot #>> '{settings,logo_public_path}') IS NULL;
