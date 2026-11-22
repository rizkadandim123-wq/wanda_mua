-- =============================================================================
-- 0001_initial_schema.sql
-- Skema database Niwayuliana Makeup Artist
-- Auth tunggal berbasis tabel public.profiles + pgcrypto (tanpa Supabase Auth email)
-- Akses write & draft dikelola server Cloudflare menggunakan SUPABASE_SERVICE_ROLE_KEY
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Profil admin tunggal (username + password_hash bcrypt)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT 'Admin Niwayuliana',
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Metadata aset media (draft disimpan di cms-private, publikasi di cms-public)
CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_bucket text NOT NULL DEFAULT 'r2' CHECK (storage_bucket IN ('r2', 'cms-private', 'cms-public')),
  storage_path text NOT NULL,
  public_path text,
  original_filename text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 5242880),
  alt_text text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (storage_bucket, storage_path)
);

-- 3. Pengaturan utama website (singleton id = 1) - menyimpan versi DRAFT aktif
CREATE TABLE IF NOT EXISTS public.site_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),

  -- Identitas Bisnis
  business_name text NOT NULL DEFAULT 'NIWAYULIANA',
  business_subtext text NOT NULL DEFAULT 'MAKEUP ARTIST',
  business_tagline text NOT NULL DEFAULT '',
  brand_display_mode text NOT NULL DEFAULT 'both' CHECK (brand_display_mode IN ('logo', 'text', 'both')),
  logo_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  favicon_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,

  -- Hero
  hero_title text NOT NULL DEFAULT 'Cantik *natural* di hari *istimewa*',
  hero_description text NOT NULL DEFAULT '',
  hero_cta_label text NOT NULL DEFAULT 'Konsultasi via WhatsApp',
  hero_whatsapp_message text NOT NULL DEFAULT '',
  hero_primary_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  hero_primary_demo_url text,
  hero_primary_alt text NOT NULL DEFAULT '',
  hero_primary_focus_x smallint NOT NULL DEFAULT 50 CHECK (hero_primary_focus_x BETWEEN 0 AND 100),
  hero_primary_focus_y smallint NOT NULL DEFAULT 28 CHECK (hero_primary_focus_y BETWEEN 0 AND 100),
  hero_primary_zoom smallint NOT NULL DEFAULT 100 CHECK (hero_primary_zoom BETWEEN 100 AND 220),
  hero_secondary_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  hero_secondary_demo_url text,
  hero_secondary_alt text NOT NULL DEFAULT '',
  hero_secondary_focus_x smallint NOT NULL DEFAULT 50 CHECK (hero_secondary_focus_x BETWEEN 0 AND 100),
  hero_secondary_focus_y smallint NOT NULL DEFAULT 50 CHECK (hero_secondary_focus_y BETWEEN 0 AND 100),
  hero_secondary_zoom smallint NOT NULL DEFAULT 100 CHECK (hero_secondary_zoom BETWEEN 100 AND 220),

  -- Tentang
  about_title text NOT NULL DEFAULT 'Sentuhan lembut yang merayakan keaslian Anda',
  about_description text NOT NULL DEFAULT '',
  about_service_area text NOT NULL DEFAULT '',
  about_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  about_demo_url text,
  about_media_alt text NOT NULL DEFAULT '',
  about_media_focus_x smallint NOT NULL DEFAULT 50 CHECK (about_media_focus_x BETWEEN 0 AND 100),
  about_media_focus_y smallint NOT NULL DEFAULT 40 CHECK (about_media_focus_y BETWEEN 0 AND 100),
  about_media_zoom smallint NOT NULL DEFAULT 100 CHECK (about_media_zoom BETWEEN 100 AND 220),

  -- Judul Bagian
  services_title text NOT NULL DEFAULT 'Sentuhan *terbaik* untuk setiap momen',
  services_subtitle text NOT NULL DEFAULT '',
  portfolio_title text NOT NULL DEFAULT 'Portofolio *Riasan*',
  portfolio_subtitle text NOT NULL DEFAULT '',
  testimonials_title text NOT NULL DEFAULT 'Cerita *Pelanggan*',
  testimonials_subtitle text NOT NULL DEFAULT 'Kesan hangat dari para klien yang telah mempercayakan momen istimewanya bersama kami.',
  contact_title text NOT NULL DEFAULT 'Mari rencanakan *riasan* hari spesial Anda',
  contact_description text NOT NULL DEFAULT '',

  -- Kontak & Media Sosial (dibiarkan kosong sampai admin mengisinya)
  whatsapp_number text NOT NULL DEFAULT '',
  whatsapp_default_message text NOT NULL DEFAULT '',
  instagram_handle text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address_or_area text NOT NULL DEFAULT '',
  operating_hours text NOT NULL DEFAULT '',
  extra_social_links jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Tampilan & Susunan
  theme_blush text NOT NULL DEFAULT '#F8E6EB',
  theme_ivory text NOT NULL DEFAULT '#FFF9F5',
  theme_accent text NOT NULL DEFAULT '#B96B78',
  theme_heading text NOT NULL DEFAULT '#8F454B',
  theme_body text NOT NULL DEFAULT '#594448',
  font_preset text NOT NULL DEFAULT 'cormorant-jakarta',
  section_order jsonb NOT NULL DEFAULT '["services","about","portfolio","testimonials","contact"]'::jsonb,
  section_visibility jsonb NOT NULL DEFAULT '{"services":true,"about":true,"portfolio":true,"testimonials":true,"contact":true}'::jsonb,

  -- SEO
  seo_title text NOT NULL DEFAULT 'Niwayuliana Makeup Artist — Riasan Natural & Elegan',
  seo_description text NOT NULL DEFAULT '',
  seo_og_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  seo_og_alt text NOT NULL DEFAULT '',

  -- Tracking versi draft
  draft_version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 3b. Kategori layanan (draft)
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Layanan makeup (draft)
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  detail_description text NOT NULL DEFAULT '',
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_label text NOT NULL DEFAULT '',
  media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  fallback_demo_url text,
  image_alt text NOT NULL DEFAULT '',
  image_focus_x smallint NOT NULL DEFAULT 50 CHECK (image_focus_x BETWEEN 0 AND 100),
  image_focus_y smallint NOT NULL DEFAULT 30 CHECK (image_focus_y BETWEEN 0 AND 100),
  image_zoom smallint NOT NULL DEFAULT 100 CHECK (image_zoom BETWEEN 100 AND 220),
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Kategori portofolio (draft)
CREATE TABLE IF NOT EXISTS public.portfolio_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Foto portofolio (draft)
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.portfolio_categories(id) ON DELETE RESTRICT,
  title text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  fallback_demo_url text,
  image_focus_x smallint NOT NULL DEFAULT 50 CHECK (image_focus_x BETWEEN 0 AND 100),
  image_focus_y smallint NOT NULL DEFAULT 35 CHECK (image_focus_y BETWEEN 0 AND 100),
  image_zoom smallint NOT NULL DEFAULT 100 CHECK (image_zoom BETWEEN 100 AND 220),
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Testimoni pelanggan (draft)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  quote text NOT NULL,
  rating smallint NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  image_alt text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Snapshot versi publikasi (hanya versi is_current = true yang terbaca pengunjung)
CREATE TABLE IF NOT EXISTS public.published_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number integer NOT NULL UNIQUE,
  snapshot jsonb NOT NULL,
  draft_version_published integer NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  published_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS one_current_published_release
  ON public.published_releases (is_current)
  WHERE is_current = true;

-- =============================================================================
-- Triggers untuk melacak perubahan draft dan updated_at secara otomatis
-- =============================================================================

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_touch ON public.profiles;
CREATE TRIGGER trg_profiles_touch
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.bump_draft_version_on_settings()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF pg_trigger_depth() = 1 THEN
    NEW.draft_version := OLD.draft_version + 1;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.bump_draft_version_from_child()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.site_settings
  SET draft_version = draft_version + 1,
      updated_at = now()
  WHERE id = 1;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_settings_bump ON public.site_settings;
CREATE TRIGGER trg_site_settings_bump
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_draft_version_on_settings();

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

DROP TRIGGER IF EXISTS trg_services_touch ON public.services;
CREATE TRIGGER trg_services_touch
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_services_bump ON public.services;
CREATE TRIGGER trg_services_bump
  AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.bump_draft_version_from_child();

DROP TRIGGER IF EXISTS trg_portfolio_categories_touch ON public.portfolio_categories;
CREATE TRIGGER trg_portfolio_categories_touch
  BEFORE UPDATE ON public.portfolio_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_portfolio_categories_bump ON public.portfolio_categories;
CREATE TRIGGER trg_portfolio_categories_bump
  AFTER INSERT OR UPDATE OR DELETE ON public.portfolio_categories
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.bump_draft_version_from_child();

DROP TRIGGER IF EXISTS trg_portfolio_items_touch ON public.portfolio_items;
CREATE TRIGGER trg_portfolio_items_touch
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_portfolio_items_bump ON public.portfolio_items;
CREATE TRIGGER trg_portfolio_items_bump
  AFTER INSERT OR UPDATE OR DELETE ON public.portfolio_items
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.bump_draft_version_from_child();

DROP TRIGGER IF EXISTS trg_testimonials_touch ON public.testimonials;
CREATE TRIGGER trg_testimonials_touch
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_testimonials_bump ON public.testimonials;
CREATE TRIGGER trg_testimonials_bump
  AFTER INSERT OR UPDATE OR DELETE ON public.testimonials
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.bump_draft_version_from_child();

-- =============================================================================
-- RPC Autentikasi Sederhana (profiles + pgcrypto) & Publikasi Atomik
-- Seluruh RPC sensitif hanya diizinkan dipanggil oleh service_role (server Cloudflare)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.has_admin_profile()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.create_initial_admin_profile(
  p_username text,
  p_password text,
  p_display_name text DEFAULT 'Admin Niwayuliana'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_username text := lower(trim(coalesce(p_username, '')));
  v_display text := trim(coalesce(p_display_name, ''));
  v_profile public.profiles%ROWTYPE;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles) THEN
    RAISE EXCEPTION 'Akun admin sudah terdaftar. Pendaftaran admin tambahan dinonaktifkan.';
  END IF;

  IF char_length(v_username) < 3 OR v_username !~ '^[a-z0-9._-]+$' THEN
    RAISE EXCEPTION 'Username minimal 3 karakter dan hanya boleh huruf, angka, titik, garis bawah, atau tanda hubung.';
  END IF;

  IF char_length(coalesce(p_password, '')) < 8 THEN
    RAISE EXCEPTION 'Kata sandi minimal harus 8 karakter.';
  END IF;

  IF v_display = '' THEN
    v_display := 'Admin Niwayuliana';
  END IF;

  INSERT INTO public.profiles (username, display_name, password_hash, role, is_active)
  VALUES (
    v_username,
    v_display,
    crypt(p_password, gen_salt('bf', 10)),
    'owner',
    true
  )
  RETURNING * INTO v_profile;

  RETURN jsonb_build_object(
    'id', v_profile.id,
    'username', v_profile.username,
    'display_name', v_profile.display_name,
    'role', v_profile.role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_admin_login(
  p_username text,
  p_password text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_username text := lower(trim(coalesce(p_username, '')));
  v_profile public.profiles%ROWTYPE;
BEGIN
  IF v_username = '' OR coalesce(p_password, '') = '' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE lower(username) = v_username
    AND is_active = true
    AND password_hash = crypt(p_password, password_hash)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_profile.id,
    'username', v_profile.username,
    'display_name', v_profile.display_name,
    'role', v_profile.role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_admin_password(
  p_profile_id uuid,
  p_current_password text,
  p_new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
BEGIN
  IF char_length(coalesce(p_new_password, '')) < 8 THEN
    RAISE EXCEPTION 'Kata sandi baru minimal harus 8 karakter.';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_profile_id
    AND is_active = true
    AND password_hash = crypt(coalesce(p_current_password, ''), password_hash)
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kata sandi saat ini tidak sesuai.';
  END IF;

  UPDATE public.profiles
  SET password_hash = crypt(p_new_password, gen_salt('bf', 10)),
      updated_at = now()
  WHERE id = p_profile_id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_published_media_path(p_media_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_path text;
BEGIN
  IF p_media_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT public_path INTO v_path
  FROM public.media_assets
  WHERE id = p_media_id;

  IF v_path IS NULL THEN
    RAISE EXCEPTION 'Media dengan id % belum dipromosikan ke bucket publik sebelum publikasi.', p_media_id;
  END IF;

  RETURN v_path;
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

-- =============================================================================
-- Row Level Security (RLS) Policies
-- Semua tabel draft & profiles dikunci total dari akses anon/authenticated langsung;
-- hanya server Cloudflare (service_role) yang mengelola draft & autentikasi.
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_releases ENABLE ROW LEVEL SECURITY;

-- Pengunjung publik hanya dapat membaca versi publikasi aktif (is_current = true)
DROP POLICY IF EXISTS "Publik baca rilis aktif" ON public.published_releases;
CREATE POLICY "Publik baca rilis aktif"
  ON public.published_releases
  FOR SELECT
  TO anon, authenticated
  USING (is_current = true);

-- Kunci eksekusi RPC agar hanya dapat dipanggil dari backend server (service_role)
REVOKE ALL ON FUNCTION public.has_admin_profile() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_initial_admin_profile(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_admin_login(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_admin_password(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.resolve_published_media_path(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.publish_site_snapshot(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_admin_profile() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_initial_admin_profile(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_admin_login(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_admin_password(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_published_media_path(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.publish_site_snapshot(uuid) TO service_role;
