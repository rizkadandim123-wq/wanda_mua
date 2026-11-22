-- =============================================================================
-- 0002_seed_initial_content.sql
-- Data awal Niwayuliana Makeup Artist (foto demo, layanan awal, kontak kosong)
-- =============================================================================

INSERT INTO public.site_settings (
  id,
  business_name,
  business_subtext,
  business_tagline,
  brand_display_mode,
  hero_title,
  hero_description,
  hero_cta_label,
  hero_whatsapp_message,
  hero_primary_demo_url,
  hero_primary_alt,
  hero_primary_focus_x,
  hero_primary_focus_y,
  hero_secondary_demo_url,
  hero_secondary_alt,
  hero_secondary_focus_x,
  hero_secondary_focus_y,
  about_title,
  about_description,
  about_service_area,
  about_demo_url,
  about_media_alt,
  about_media_focus_x,
  about_media_focus_y,
  services_title,
  services_subtitle,
  portfolio_title,
  portfolio_subtitle,
  testimonials_title,
  testimonials_subtitle,
  contact_title,
  contact_description,
  whatsapp_number,
  whatsapp_default_message,
  instagram_handle,
  instagram_url,
  email,
  address_or_area,
  operating_hours,
  extra_social_links,
  theme_blush,
  theme_ivory,
  theme_accent,
  theme_heading,
  theme_body,
  font_preset,
  section_order,
  section_visibility,
  seo_title,
  seo_description,
  seo_og_alt
)
VALUES (
  1,
  'NIWAYULIANA',
  'MAKEUP ARTIST',
  'Riasan lembut dan natural yang memancarkan pesona alami Anda di setiap momen istimewa.',
  'both',
  'Cantik *natural* di hari *istimewa*',
  'Riasan profesional yang menonjolkan kecantikan alami, elegan, dan tahan lama untuk setiap momen berharga Anda.',
  'Konsultasi via WhatsApp',
  'Halo Niwayuliana Makeup Artist, saya ingin berkonsultasi mengenai jadwal dan layanan makeup.',
  '/demo/hero-main.png',
  'Foto demo riasan pengantin natural dengan nuansa Soft Blush',
  50,
  26,
  '/demo/hero-detail.png',
  'Foto demo detail riasan wajah lembut dan berkilau alami',
  50,
  50,
  'Keindahan yang terasa *personal* dan tetap menjadi diri Anda',
  E'Setiap wajah memiliki karakter dan pesona unik. Niwayuliana Makeup Artist hadir dengan pendekatan riasan yang ringan di kulit, menyatu halus, dan tahan lama sepanjang acara.\n\nMelalui konsultasi warna kulit, konsep busana, dan kenyamanan pribadi Anda, setiap detail dirangkai agar hasil riasan tampak segar baik secara langsung maupun di depan kamera.',
  '',
  '/demo/about-mua.png',
  'Foto demo perlengkapan dan suasana kerja Niwayuliana Makeup Artist',
  50,
  45,
  'Sentuhan *terbaik* untuk setiap momen',
  'Pilihan layanan riasan yang dirancang khusus untuk mendampingi momen penting Anda dengan hasil lembut dan menawan.',
  'Portofolio *Riasan*',
  'Inspirasi tampilan natural hingga soft glam yang dapat disesuaikan dengan karakter acara Anda.',
  'Cerita *Pelanggan*',
  'Kesan hangat dari para klien yang telah mempercayakan momen istimewanya bersama kami.',
  'Mari rencanakan *riasan* hari spesial Anda',
  'Silakan hubungi kami untuk menanyakan ketersediaan tanggal, konsultasi konsep riasan, atau penyesuaian jadwal acara Anda.',
  '',
  'Halo Niwayuliana Makeup Artist, saya ingin berkonsultasi mengenai layanan makeup.',
  '',
  '',
  '',
  '',
  '',
  '[]'::jsonb,
  '#F8E6EB',
  '#FFF9F5',
  '#B96B78',
  '#8F454B',
  '#594448',
  'cormorant-jakarta',
  '["services","about","portfolio","testimonials","contact"]'::jsonb,
  '{"services":true,"about":true,"portfolio":true,"testimonials":true,"contact":true}'::jsonb,
  'Niwayuliana Makeup Artist — Riasan Natural & Elegan',
  'Riasan profesional yang menonjolkan kecantikan alami, elegan, dan tahan lama untuk bridal, engagement, dan graduation.',
  'Niwayuliana Makeup Artist Soft Blush'
)
ON CONFLICT (id) DO NOTHING;

-- Seed kategori layanan & kategori portofolio awal
DO $$
DECLARE
  v_svc_bridal uuid;
  v_svc_engagement uuid;
  v_svc_graduation uuid;
  v_cat_bridal uuid;
  v_cat_engagement uuid;
  v_cat_graduation uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.service_categories) THEN
    INSERT INTO public.service_categories (name, slug, sort_order)
    VALUES ('Bridal', 'bridal', 1)
    RETURNING id INTO v_svc_bridal;

    INSERT INTO public.service_categories (name, slug, sort_order)
    VALUES ('Engagement', 'engagement', 2)
    RETURNING id INTO v_svc_engagement;

    INSERT INTO public.service_categories (name, slug, sort_order)
    VALUES ('Graduation', 'graduation', 3)
    RETURNING id INTO v_svc_graduation;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.portfolio_categories) THEN
    INSERT INTO public.portfolio_categories (name, slug, sort_order)
    VALUES ('Bridal Makeup', 'bridal-makeup', 1)
    RETURNING id INTO v_cat_bridal;

    INSERT INTO public.portfolio_categories (name, slug, sort_order)
    VALUES ('Engagement', 'engagement', 2)
    RETURNING id INTO v_cat_engagement;

    INSERT INTO public.portfolio_categories (name, slug, sort_order)
    VALUES ('Graduation', 'graduation', 3)
    RETURNING id INTO v_cat_graduation;

    -- Seed 3 layanan awal
    IF NOT EXISTS (SELECT 1 FROM public.services) THEN
      INSERT INTO public.services (
        category_id,
        name,
        short_description,
        detail_description,
        highlights,
        price_label,
        fallback_demo_url,
        image_alt,
        image_focus_x,
        image_focus_y,
        sort_order,
        is_visible
      )
      VALUES
      (
        v_svc_bridal,
        'Bridal Makeup',
        'Riasan pengantin yang halus, bercahaya alami, dan dirancang tahan lama dari akad hingga resepsi.',
        E'Paket riasan khusus hari pernikahan dengan persiapan kulit menyeluruh agar complexion menyatu sempurna, ringan, dan bebas crack sepanjang acara.\n\nTersedia konsultasi nuansa warna, detail riasan mata lembut, serta penyesuaian look untuk akad, pemberkatan, maupun resepsi.',
        '["Konsultasi konsep look & warna busana","Skin prep menyeluruh agar makeup tahan lama","Pemasangan bulu mata natural & touch-up kit"]'::jsonb,
        '',
        '/demo/service-bridal.png',
        'Foto demo layanan Bridal Makeup bernuansa Soft Blush',
        50,
        28,
        1,
        true
      ),
      (
        v_svc_engagement,
        'Engagement',
        'Tampilan feminin yang manis dan segar untuk momen pertunangan atau lamaran yang hangat.',
        E'Riasan soft glam bernuansa rose dan peach yang mempertegas fitur wajah secara lembut tanpa terlihat berlebihan.\n\nCocok dipadukan dengan kebaya modern, gaun pastel, maupun busana adat bernuansa lembut.',
        '["Riasan soft glam bernuansa rose & peach","Complexion ringan dan halus di kulit","Bulu mata lembut & penataan aksen wajah"]'::jsonb,
        '',
        '/demo/service-engagement.png',
        'Foto demo layanan Engagement Makeup yang lembut dan anggun',
        50,
        28,
        2,
        true
      ),
      (
        v_svc_graduation,
        'Graduation',
        'Riasan cerah natural dan rapi yang nyaman dikenakan sepanjang prosesi wisuda dan sesi foto.',
        E'Makeup ringan dengan hasil akhir segar dan fotogenik untuk hari kelulusan Anda.\n\nDirancang agar tetap nyaman di bawah cahaya studio maupun luar ruangan serta tahan lama hingga sesi foto keluarga selesai.',
        '["Makeup segar tahan lama untuk sesi foto","Hasil akhir cerah natural & bebas cakey","Penyesuaian warna sesuai kebaya atau toga"]'::jsonb,
        '',
        '/demo/service-graduation.png',
        'Foto demo layanan Graduation Makeup natural dan segar',
        50,
        28,
        3,
        true
      );
    END IF;

    -- Seed 3 item portofolio demo awal (jujur diberi keterangan foto demo)
    IF NOT EXISTS (SELECT 1 FROM public.portfolio_items) THEN
      INSERT INTO public.portfolio_items (
        category_id,
        title,
        alt_text,
        fallback_demo_url,
        image_focus_x,
        image_focus_y,
        sort_order,
        is_visible
      )
      VALUES
      (
        v_cat_bridal,
        'Soft Luminous Bridal (Foto Demo)',
        'Foto demo portofolio riasan pengantin natural lembut',
        '/demo/service-bridal.png',
        50,
        28,
        1,
        true
      ),
      (
        v_cat_engagement,
        'Rose Blush Engagement (Foto Demo)',
        'Foto demo portofolio riasan lamaran bernuansa rose lembut',
        '/demo/service-engagement.png',
        50,
        28,
        2,
        true
      ),
      (
        v_cat_graduation,
        'Fresh Radiant Graduation (Foto Demo)',
        'Foto demo portofolio riasan wisuda segar dan natural',
        '/demo/service-graduation.png',
        50,
        28,
        3,
        true
      );
    END IF;
  END IF;
END;
$$;

-- Pastikan draft_version = 1 pada setup awal, lalu buat rilis publikasi versi 1 jika belum ada
UPDATE public.site_settings
SET draft_version = 1
WHERE id = 1
  AND NOT EXISTS (SELECT 1 FROM public.published_releases);

DO $$
DECLARE
  v_settings public.site_settings%ROWTYPE;
  v_service_categories_json jsonb;
  v_services_json jsonb;
  v_categories_json jsonb;
  v_portfolio_json jsonb;
  v_snapshot jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.published_releases) THEN
    SELECT * INTO v_settings FROM public.site_settings WHERE id = 1;

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
          'public_path', NULL,
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
          'public_path', NULL,
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

    v_snapshot := jsonb_build_object(
      'settings', jsonb_build_object(
        'business_name', v_settings.business_name,
        'business_subtext', v_settings.business_subtext,
        'business_tagline', v_settings.business_tagline,
        'brand_display_mode', v_settings.brand_display_mode,
        'logo_public_path', NULL,
        'favicon_public_path', NULL,
        'hero_title', v_settings.hero_title,
        'hero_description', v_settings.hero_description,
        'hero_cta_label', v_settings.hero_cta_label,
        'hero_whatsapp_message', v_settings.hero_whatsapp_message,
        'hero_primary_public_path', NULL,
        'hero_primary_demo_url', v_settings.hero_primary_demo_url,
        'hero_primary_alt', v_settings.hero_primary_alt,
        'hero_primary_focus_x', v_settings.hero_primary_focus_x,
        'hero_primary_focus_y', v_settings.hero_primary_focus_y,
        'hero_primary_zoom', v_settings.hero_primary_zoom,
        'hero_secondary_public_path', NULL,
        'hero_secondary_demo_url', v_settings.hero_secondary_demo_url,
        'hero_secondary_alt', v_settings.hero_secondary_alt,
        'hero_secondary_focus_x', v_settings.hero_secondary_focus_x,
        'hero_secondary_focus_y', v_settings.hero_secondary_focus_y,
        'hero_secondary_zoom', v_settings.hero_secondary_zoom,
        'about_title', v_settings.about_title,
        'about_description', v_settings.about_description,
        'about_service_area', v_settings.about_service_area,
        'about_public_path', NULL,
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
        'seo_og_public_path', NULL,
        'seo_og_alt', v_settings.seo_og_alt
      ),
      'service_categories', v_service_categories_json,
      'services', v_services_json,
      'portfolio_categories', v_categories_json,
      'portfolio_items', v_portfolio_json,
      'testimonials', '[]'::jsonb
    );

    INSERT INTO public.published_releases (
      version_number,
      snapshot,
      draft_version_published,
      is_current
    )
    VALUES (
      1,
      v_snapshot,
      v_settings.draft_version,
      true
    );
  END IF;
END;
$$;
