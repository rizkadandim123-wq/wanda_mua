-- =============================================================================
-- 0004_service_categories_and_testimonials_rating.sql
-- Tambah:
--   1. Tabel public.service_categories + category_id & highlights (isian) pada services
--   2. testimonials_subtitle pada site_settings & rating (1-5 bintang) pada testimonials
--   3. Update fungsi publish_site_snapshot agar menyertakan kategori layanan, isian paket,
--      subjudul testimoni, dan rating bintang.
-- Aman dijalankan pada database yang sudah menjalankan 0001, 0002, 0003.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_service_categories_touch ON public.service_categories;
CREATE TRIGGER trg_service_categories_touch
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_service_categories_bump ON public.service_categories;
CREATE TRIGGER trg_service_categories_bump
  AFTER INSERT OR UPDATE OR DELETE ON public.service_categories
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.bump_draft_version_from_child();

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS highlights jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS testimonials_subtitle text NOT NULL DEFAULT 'Kesan hangat dari para klien yang telah mempercayakan momen istimewanya bersama kami.';

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS rating smallint NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5);

-- Seed kategori layanan awal & hubungkan layanan bawaan bila belum terisi
DO $$
DECLARE
  v_cat_bridal uuid;
  v_cat_engagement uuid;
  v_cat_graduation uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.service_categories) THEN
    INSERT INTO public.service_categories (name, slug, sort_order)
    VALUES ('Bridal', 'bridal', 1)
    RETURNING id INTO v_cat_bridal;

    INSERT INTO public.service_categories (name, slug, sort_order)
    VALUES ('Engagement', 'engagement', 2)
    RETURNING id INTO v_cat_engagement;

    INSERT INTO public.service_categories (name, slug, sort_order)
    VALUES ('Graduation', 'graduation', 3)
    RETURNING id INTO v_cat_graduation;

    UPDATE public.services
    SET category_id = v_cat_bridal,
        highlights = CASE
          WHEN highlights = '[]'::jsonb THEN '["Konsultasi konsep look & warna busana","Skin prep menyeluruh agar makeup tahan lama","Pemasangan bulu mata natural & touch-up kit"]'::jsonb
          ELSE highlights
        END
    WHERE lower(name) LIKE '%bridal%' AND category_id IS NULL;

    UPDATE public.services
    SET category_id = v_cat_engagement,
        highlights = CASE
          WHEN highlights = '[]'::jsonb THEN '["Riasan soft glam bernuansa rose & peach","Complexion ringan dan halus di kulit","Bulu mata lembut & penataan aksen wajah"]'::jsonb
          ELSE highlights
        END
    WHERE lower(name) LIKE '%engagement%' AND category_id IS NULL;

    UPDATE public.services
    SET category_id = v_cat_graduation,
        highlights = CASE
          WHEN highlights = '[]'::jsonb THEN '["Makeup segar tahan lama untuk sesi foto","Hasil akhir cerah natural & bebas cakey","Penyesuaian warna sesuai kebaya atau toga"]'::jsonb
          ELSE highlights
        END
    WHERE lower(name) LIKE '%graduation%' AND category_id IS NULL;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.publish_site_snapshot(
  p_profile_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.site_settings%ROWTYPE;
  v_service_categories_json jsonb;
  v_services_json jsonb;
  v_categories_json jsonb;
  v_portfolio_json jsonb;
  v_testimonials_json jsonb;
  v_snapshot jsonb;
  v_next_version integer;
  v_release_id uuid;
  v_published_at timestamptz := now();
  v_media_ids uuid[];
BEGIN
  SELECT * INTO v_settings
  FROM public.site_settings
  WHERE id = 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengaturan situs (site_settings id=1) tidak ditemukan.';
  END IF;

  SELECT ARRAY(
    SELECT DISTINCT mid FROM (
      SELECT v_settings.logo_media_id AS mid
      UNION ALL SELECT v_settings.favicon_media_id
      UNION ALL SELECT v_settings.hero_primary_media_id
      UNION ALL SELECT v_settings.hero_secondary_media_id
      UNION ALL SELECT v_settings.about_media_id
      UNION ALL SELECT v_settings.seo_og_media_id
      UNION ALL SELECT s.media_id FROM public.services s WHERE s.is_visible = true
      UNION ALL SELECT p.media_id FROM public.portfolio_items p WHERE p.is_visible = true
    ) m
    WHERE mid IS NOT NULL
  ) INTO v_media_ids;

  IF array_length(v_media_ids, 1) IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM unnest(v_media_ids) AS req(id)
      LEFT JOIN public.media_assets ma ON ma.id = req.id
      WHERE ma.id IS NULL OR ma.public_path IS NULL
    ) THEN
      RAISE EXCEPTION 'Terdapat gambar draft yang belum siap dipublikasikan. Silakan ulangi proses publikasi.';
    END IF;

    UPDATE public.media_assets
    SET is_published = true
    WHERE id = ANY(v_media_ids);
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', sc.id,
        'name', sc.name,
        'slug', sc.slug,
        'sort_order', sc.sort_order
      )
      ORDER BY sc.sort_order ASC, sc.created_at ASC
    ),
    '[]'::jsonb
  ) INTO v_service_categories_json
  FROM public.service_categories sc;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'category_id', s.category_id,
        'name', s.name,
        'short_description', s.short_description,
        'detail_description', s.detail_description,
        'highlights', COALESCE(s.highlights, '[]'::jsonb),
        'price_label', s.price_label,
        'public_path', public.resolve_published_media_path(s.media_id),
        'fallback_demo_url', s.fallback_demo_url,
        'image_alt', s.image_alt,
        'image_focus_x', s.image_focus_x,
        'image_focus_y', s.image_focus_y,
        'image_zoom', s.image_zoom,
        'sort_order', s.sort_order
      )
      ORDER BY s.sort_order ASC, s.created_at ASC
    ),
    '[]'::jsonb
  ) INTO v_services_json
  FROM public.services s
  WHERE s.is_visible = true;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'slug', c.slug,
        'sort_order', c.sort_order
      )
      ORDER BY c.sort_order ASC, c.created_at ASC
    ),
    '[]'::jsonb
  ) INTO v_categories_json
  FROM public.portfolio_categories c;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'category_id', p.category_id,
        'title', p.title,
        'alt_text', p.alt_text,
        'public_path', public.resolve_published_media_path(p.media_id),
        'fallback_demo_url', p.fallback_demo_url,
        'image_focus_x', p.image_focus_x,
        'image_focus_y', p.image_focus_y,
        'image_zoom', p.image_zoom,
        'sort_order', p.sort_order
      )
      ORDER BY p.sort_order ASC, p.created_at ASC
    ),
    '[]'::jsonb
  ) INTO v_portfolio_json
  FROM public.portfolio_items p
  WHERE p.is_visible = true;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'client_name', t.client_name,
        'quote', t.quote,
        'rating', COALESCE(t.rating, 5),
        'sort_order', t.sort_order
      )
      ORDER BY t.sort_order ASC, t.created_at ASC
    ),
    '[]'::jsonb
  ) INTO v_testimonials_json
  FROM public.testimonials t
  WHERE t.is_visible = true;

  v_snapshot := jsonb_build_object(
    'settings', jsonb_build_object(
      'business_name', v_settings.business_name,
      'business_subtext', v_settings.business_subtext,
      'business_tagline', v_settings.business_tagline,
      'brand_display_mode', v_settings.brand_display_mode,
      'logo_public_path', public.resolve_published_media_path(v_settings.logo_media_id),
      'favicon_public_path', public.resolve_published_media_path(v_settings.favicon_media_id),
      'hero_title', v_settings.hero_title,
      'hero_description', v_settings.hero_description,
      'hero_cta_label', v_settings.hero_cta_label,
      'hero_whatsapp_message', v_settings.hero_whatsapp_message,
      'hero_primary_public_path', public.resolve_published_media_path(v_settings.hero_primary_media_id),
      'hero_primary_demo_url', v_settings.hero_primary_demo_url,
      'hero_primary_alt', v_settings.hero_primary_alt,
      'hero_primary_focus_x', v_settings.hero_primary_focus_x,
      'hero_primary_focus_y', v_settings.hero_primary_focus_y,
      'hero_primary_zoom', v_settings.hero_primary_zoom,
      'hero_secondary_public_path', public.resolve_published_media_path(v_settings.hero_secondary_media_id),
      'hero_secondary_demo_url', v_settings.hero_secondary_demo_url,
      'hero_secondary_alt', v_settings.hero_secondary_alt,
      'hero_secondary_focus_x', v_settings.hero_secondary_focus_x,
      'hero_secondary_focus_y', v_settings.hero_secondary_focus_y,
      'hero_secondary_zoom', v_settings.hero_secondary_zoom,
      'about_title', v_settings.about_title,
      'about_description', v_settings.about_description,
      'about_service_area', v_settings.about_service_area,
      'about_public_path', public.resolve_published_media_path(v_settings.about_media_id),
      'about_demo_url', v_settings.about_demo_url,
      'about_media_alt', v_settings.about_media_alt,
      'about_media_focus_x', v_settings.about_media_focus_x,
      'about_media_focus_y', v_settings.about_media_focus_y,
      'about_media_zoom', v_settings.about_media_zoom
    ) || jsonb_build_object(
      'services_title', v_settings.services_title,
      'services_subtitle', v_settings.services_subtitle,
      'portfolio_title', v_settings.portfolio_title,
      'portfolio_subtitle', v_settings.portfolio_subtitle,
      'testimonials_title', v_settings.testimonials_title,
      'testimonials_subtitle', v_settings.testimonials_subtitle,
      'contact_title', v_settings.contact_title,
      'contact_description', v_settings.contact_description,
      'whatsapp_number', v_settings.whatsapp_number,
      'whatsapp_default_message', v_settings.whatsapp_default_message,
      'instagram_handle', v_settings.instagram_handle,
      'instagram_url', v_settings.instagram_url,
      'email', v_settings.email,
      'address_or_area', v_settings.address_or_area,
      'operating_hours', v_settings.operating_hours,
      'extra_social_links', v_settings.extra_social_links,
      'theme_blush', v_settings.theme_blush,
      'theme_ivory', v_settings.theme_ivory,
      'theme_accent', v_settings.theme_accent,
      'theme_heading', v_settings.theme_heading,
      'theme_body', v_settings.theme_body,
      'font_preset', v_settings.font_preset,
      'section_order', v_settings.section_order,
      'section_visibility', v_settings.section_visibility,
      'seo_title', v_settings.seo_title,
      'seo_description', v_settings.seo_description,
      'seo_og_public_path', public.resolve_published_media_path(v_settings.seo_og_media_id),
      'seo_og_alt', v_settings.seo_og_alt
    ),
    'service_categories', v_service_categories_json,
    'services', v_services_json,
    'portfolio_categories', v_categories_json,
    'portfolio_items', v_portfolio_json,
    'testimonials', v_testimonials_json
  );

  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
  FROM public.published_releases;

  UPDATE public.published_releases
  SET is_current = false
  WHERE is_current = true;

  INSERT INTO public.published_releases (
    version_number,
    snapshot,
    draft_version_published,
    is_current,
    published_by,
    published_at
  )
  VALUES (
    v_next_version,
    v_snapshot,
    v_settings.draft_version,
    true,
    p_profile_id,
    v_published_at
  )
  RETURNING id INTO v_release_id;

  RETURN jsonb_build_object(
    'id', v_release_id,
    'version_number', v_next_version,
    'draft_version_published', v_settings.draft_version,
    'published_at', v_published_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.publish_site_snapshot(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_site_snapshot(uuid) TO service_role;
