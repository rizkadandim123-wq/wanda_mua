-- =============================================================================
-- 0007_seed_8_portfolio_demo.sql
-- Mengisi 8 foto portofolio editorial (4 kategori) lengkap dengan nama & fokus wajah,
-- lalu mempublikasikan snapshot terbaru agar langsung tampil di website live.
-- =============================================================================

DO $$
DECLARE
  v_cat_bridal uuid;
  v_cat_engagement uuid;
  v_cat_graduation uuid;
  v_cat_party uuid;
BEGIN
  -- Pastikan 4 kategori portofolio tersedia
  SELECT id INTO v_cat_bridal FROM public.portfolio_categories WHERE slug = 'bridal-makeup' LIMIT 1;
  IF v_cat_bridal IS NULL THEN
    INSERT INTO public.portfolio_categories (name, slug, sort_order)
    VALUES ('Bridal Makeup', 'bridal-makeup', 1)
    RETURNING id INTO v_cat_bridal;
  END IF;

  SELECT id INTO v_cat_engagement FROM public.portfolio_categories WHERE slug = 'engagement' LIMIT 1;
  IF v_cat_engagement IS NULL THEN
    INSERT INTO public.portfolio_categories (name, slug, sort_order)
    VALUES ('Engagement', 'engagement', 2)
    RETURNING id INTO v_cat_engagement;
  END IF;

  SELECT id INTO v_cat_graduation FROM public.portfolio_categories WHERE slug = 'graduation' LIMIT 1;
  IF v_cat_graduation IS NULL THEN
    INSERT INTO public.portfolio_categories (name, slug, sort_order)
    VALUES ('Graduation', 'graduation', 3)
    RETURNING id INTO v_cat_graduation;
  END IF;

  SELECT id INTO v_cat_party FROM public.portfolio_categories WHERE slug = 'party-event' LIMIT 1;
  IF v_cat_party IS NULL THEN
    INSERT INTO public.portfolio_categories (name, slug, sort_order)
    VALUES ('Party & Event', 'party-event', 4)
    RETURNING id INTO v_cat_party;
  END IF;

  -- Ganti daftar portofolio dengan 8 foto editorial rapi
  DELETE FROM public.portfolio_items;

  INSERT INTO public.portfolio_items (
    category_id,
    title,
    alt_text,
    fallback_demo_url,
    image_focus_x,
    image_focus_y,
    image_zoom,
    sort_order,
    is_visible
  )
  VALUES
  (
    v_cat_bridal,
    'Soft Luminous Bridal',
    'Portofolio riasan pengantin natural lembut bercahaya',
    '/demo/service-bridal.png',
    50,
    26,
    100,
    1,
    true
  ),
  (
    v_cat_engagement,
    'Rose Blush Engagement',
    'Portofolio riasan lamaran bernuansa rose blush lembut',
    '/demo/service-engagement.png',
    50,
    26,
    100,
    2,
    true
  ),
  (
    v_cat_graduation,
    'Fresh Radiant Graduation',
    'Portofolio riasan wisuda segar dan natural',
    '/demo/service-graduation.png',
    50,
    26,
    100,
    3,
    true
  ),
  (
    v_cat_bridal,
    'Classic Melati & Pearl Bridal',
    'Portofolio riasan pengantin kebaya ivory dengan melati dan mutiara',
    '/demo/portfolio-4.jpg',
    50,
    24,
    100,
    4,
    true
  ),
  (
    v_cat_engagement,
    'Pastel Kebaya Soft Glam',
    'Portofolio riasan lamaran soft glam dengan kebaya pastel blush',
    '/demo/portfolio-5.jpg',
    50,
    24,
    100,
    5,
    true
  ),
  (
    v_cat_graduation,
    'Champagne Hijab Graduation',
    'Portofolio riasan wisuda hijab champagne natural glowing',
    '/demo/portfolio-6.jpg',
    50,
    24,
    100,
    6,
    true
  ),
  (
    v_cat_party,
    'Romantic Dewy Prewedding',
    'Portofolio riasan prewedding dewy lembut dan romantis',
    '/demo/portfolio-8.jpg',
    50,
    24,
    100,
    7,
    true
  ),
  (
    v_cat_party,
    'Velvet Bronze Party Glam',
    'Portofolio riasan pesta soft glam bernuansa bronze dan rosewood',
    '/demo/portfolio-7.jpg',
    50,
    24,
    100,
    8,
    true
  );
END;
$$;

-- Publikasikan langsung snapshot terbaru agar 8 foto portofolio langsung tampil live
SELECT public.publish_site_snapshot(NULL, 'Seed 8 foto portofolio editorial');
