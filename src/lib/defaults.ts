import type {
  FontPresetKey,
  PublishedSnapshot,
  SectionKey,
  SiteCopy,
  WhatsAppQuickPreset,
} from '../types/cms';

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'services',
  'about',
  'portfolio',
  'testimonials',
  'contact',
];

export const DEFAULT_SECTION_VISIBILITY: Record<SectionKey, boolean> = {
  services: true,
  about: true,
  portfolio: true,
  testimonials: true,
  contact: true,
};

export const SECTION_LABELS: Record<SectionKey, string> = {
  services: 'Layanan',
  about: 'Tentang',
  portfolio: 'Portofolio',
  testimonials: 'Testimoni',
  contact: 'Kontak',
};

export const DEFAULT_THEME = {
  theme_blush: '#F8E6EB',
  theme_ivory: '#FFF9F5',
  theme_accent: '#B96B78',
  theme_heading: '#8F454B',
  theme_body: '#594448',
  font_preset: 'cormorant-jakarta' as FontPresetKey,
  section_order: DEFAULT_SECTION_ORDER,
  section_visibility: DEFAULT_SECTION_VISIBILITY,
};

export interface FontPresetConfig {
  key: FontPresetKey;
  label: string;
  description: string;
  serifFont: string;
  sansFont: string;
}

export const FONT_PRESETS: FontPresetConfig[] = [
  {
    key: 'cormorant-jakarta',
    label: 'Cormorant Garamond + Plus Jakarta Sans',
    description: 'Klasik editorial lembut & sangat bersih dibaca (Default Soft Blush)',
    serifFont: "'Cormorant Garamond', Georgia, serif",
    sansFont: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  },
  {
    key: 'playfair-dm',
    label: 'Playfair Display + DM Sans',
    description: 'Romantis kontras tinggi dengan teks modern yang rapi',
    serifFont: "'Playfair Display', Georgia, serif",
    sansFont: "'DM Sans', system-ui, -apple-system, sans-serif",
  },
  {
    key: 'lora-nunito',
    label: 'Lora + Nunito Sans',
    description: 'Hangat, bersahabat, dan lembut di segala ukuran layar',
    serifFont: "'Lora', Georgia, serif",
    sansFont: "'Nunito Sans', system-ui, -apple-system, sans-serif",
  },
  {
    key: 'fraunces-inter',
    label: 'Fraunces + Inter',
    description: 'Sentuhan editorial kontemporer dengan kurva lembut',
    serifFont: "'Fraunces', Georgia, serif",
    sansFont: "'Inter', system-ui, -apple-system, sans-serif",
  },
];

export function getFontPreset(key: string): FontPresetConfig {
  return FONT_PRESETS.find((item) => item.key === key) ?? FONT_PRESETS[0];
}

export const DEFAULT_BRAND_LOGO_URL = '/logo-niwa.png';

export const DEFAULT_SITE_COPY: SiteCopy = {
  hero_secondary_cta_label: 'Lihat Layanan',
  hero_badge_text: 'Natural · Luminous · Timeless',
  hero_detail_caption: 'Signature Natural & Soft Glam',

  services_eyebrow: 'Curated Services',
  about_eyebrow: 'Tentang Kami',
  portfolio_eyebrow: 'Beauty Lookbook',
  testimonials_eyebrow: 'Kind Words',

  contact_eyebrow: 'Reservation & Inquiry',
  contact_cta_label: 'Konsultasi via WhatsApp',
  contact_note: 'Private Appointment',
  contact_card_eyebrow: 'Atelier Concierge',
  contact_card_title: 'Informasi & Jadwal Layanan',

  feedback_visible: true,
  feedback_eyebrow: 'Guestbook & Feedback',
  feedback_title: 'Saran & *Masukan* Anda',
  feedback_subtitle:
    'Punya masukan, ulasan, atau pesan untuk kami? Tuliskan di bawah ini agar kami dapat terus menghadirkan pelayanan riasan terbaik.',
  feedback_topics: ['Saran & Masukan', 'Ulasan Pengalaman', 'Pertanyaan Layanan', 'Lainnya'],
  feedback_submit_label: 'Kirim Masukan',
  feedback_note: 'Pesan Anda akan langsung diteruskan ke tim resmi kami.',
  feedback_success_title: 'Terima Kasih atas Masukan Anda',
  feedback_success_message:
    'Pesan Anda sudah terkirim dan akan menjadi catatan berharga bagi tim kami.',

  wa_widget_subtitle: 'Konsultasi via WhatsApp',
  wa_widget_greeting:
    'Halo! Silakan tulis pesan Anda di bawah atau langsung kirim pesan default untuk terhubung ke WhatsApp kami.',
  wa_widget_button_label: 'Kirim ke WhatsApp',
  wa_widget_presets: [
    {
      label: 'Tanya Jadwal',
      text: 'Halo Niwayuliana Makeup Artist, saya ingin menanyakan ketersediaan jadwal makeup.',
    },
    {
      label: 'Bridal / Acara',
      text: 'Halo Niwayuliana Makeup Artist, saya ingin berkonsultasi mengenai paket makeup Bridal / acara spesial.',
    },
  ],
};

function readCopyString(obj: Record<string, unknown>, key: keyof SiteCopy, fallback: string): string {
  const val = obj[key];
  return typeof val === 'string' ? val : fallback;
}

function readCopyStringArray(
  obj: Record<string, unknown>,
  key: keyof SiteCopy,
  fallback: string[]
): string[] {
  const val = obj[key];
  if (!Array.isArray(val)) return [...fallback];
  const cleaned = val
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
  return cleaned.length > 0 ? cleaned : [...fallback];
}

function readCopyPresets(
  obj: Record<string, unknown>,
  fallback: WhatsAppQuickPreset[]
): WhatsAppQuickPreset[] {
  const val = obj.wa_widget_presets;
  if (!Array.isArray(val)) return fallback.map((p) => ({ ...p }));
  return val
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      label: typeof item.label === 'string' ? item.label.trim() : '',
      text: typeof item.text === 'string' ? item.text.trim() : '',
    }))
    .filter((item) => Boolean(item.label && item.text));
}

export function normalizeSiteCopy(raw: unknown): SiteCopy {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const d = DEFAULT_SITE_COPY;

  return {
    hero_secondary_cta_label: readCopyString(obj, 'hero_secondary_cta_label', d.hero_secondary_cta_label),
    hero_badge_text: readCopyString(obj, 'hero_badge_text', d.hero_badge_text),
    hero_detail_caption: readCopyString(obj, 'hero_detail_caption', d.hero_detail_caption),

    services_eyebrow: readCopyString(obj, 'services_eyebrow', d.services_eyebrow),
    about_eyebrow: readCopyString(obj, 'about_eyebrow', d.about_eyebrow),
    portfolio_eyebrow: readCopyString(obj, 'portfolio_eyebrow', d.portfolio_eyebrow),
    testimonials_eyebrow: readCopyString(obj, 'testimonials_eyebrow', d.testimonials_eyebrow),

    contact_eyebrow: readCopyString(obj, 'contact_eyebrow', d.contact_eyebrow),
    contact_cta_label: readCopyString(obj, 'contact_cta_label', d.contact_cta_label),
    contact_note: readCopyString(obj, 'contact_note', d.contact_note),
    contact_card_eyebrow: readCopyString(obj, 'contact_card_eyebrow', d.contact_card_eyebrow),
    contact_card_title: readCopyString(obj, 'contact_card_title', d.contact_card_title),

    feedback_visible:
      typeof obj.feedback_visible === 'boolean' ? obj.feedback_visible : d.feedback_visible,
    feedback_eyebrow: readCopyString(obj, 'feedback_eyebrow', d.feedback_eyebrow),
    feedback_title: readCopyString(obj, 'feedback_title', d.feedback_title),
    feedback_subtitle: readCopyString(obj, 'feedback_subtitle', d.feedback_subtitle),
    feedback_topics: readCopyStringArray(obj, 'feedback_topics', d.feedback_topics),
    feedback_submit_label: readCopyString(obj, 'feedback_submit_label', d.feedback_submit_label),
    feedback_note: readCopyString(obj, 'feedback_note', d.feedback_note),
    feedback_success_title: readCopyString(obj, 'feedback_success_title', d.feedback_success_title),
    feedback_success_message: readCopyString(
      obj,
      'feedback_success_message',
      d.feedback_success_message
    ),

    wa_widget_subtitle: readCopyString(obj, 'wa_widget_subtitle', d.wa_widget_subtitle),
    wa_widget_greeting: readCopyString(obj, 'wa_widget_greeting', d.wa_widget_greeting),
    wa_widget_button_label: readCopyString(obj, 'wa_widget_button_label', d.wa_widget_button_label),
    wa_widget_presets: readCopyPresets(obj, d.wa_widget_presets),
  };
}

export function resolveBrandLogoUrl(logoUrl: string | null | undefined): string {
  const trimmed = logoUrl?.trim();
  if (
    !trimmed ||
    trimmed === '/logo.svg' ||
    trimmed === '/logo-niwayuliana.png' ||
    trimmed === DEFAULT_BRAND_LOGO_URL
  ) {
    return DEFAULT_BRAND_LOGO_URL;
  }
  return trimmed;
}

export const DEFAULT_DEMO_SNAPSHOT: PublishedSnapshot = {
  version_number: 1,
  published_at: null,
  settings: {
    business_name: 'NIWAYULIANA',
    business_subtext: 'MAKEUP ARTIST',
    business_tagline:
      'Riasan lembut dan natural yang memancarkan pesona alami Anda di setiap momen istimewa.',
    brand_display_mode: 'both',
    logo_url: DEFAULT_BRAND_LOGO_URL,
    favicon_url: null,

    hero_title: 'Cantik *natural* di hari *istimewa*',
    hero_description:
      'Riasan profesional yang menonjolkan kecantikan alami, elegan, dan tahan lama untuk setiap momen berharga Anda.',
    hero_cta_label: 'Konsultasi via WhatsApp',
    hero_whatsapp_message:
      'Halo Niwayuliana Makeup Artist, saya ingin berkonsultasi mengenai jadwal dan layanan makeup.',
    hero_primary_url: '/demo/hero-main.png',
    hero_primary_alt: 'Foto demo riasan pengantin natural dengan nuansa Soft Blush',
    hero_primary_focus_x: 50,
    hero_primary_focus_y: 26,
    hero_primary_zoom: 100,
    hero_secondary_url: '/demo/hero-detail.png',
    hero_secondary_alt: 'Foto demo detail riasan wajah lembut dan berkilau alami',
    hero_secondary_focus_x: 50,
    hero_secondary_focus_y: 50,
    hero_secondary_zoom: 100,

    about_title: 'Keindahan yang terasa *personal* dan tetap menjadi diri Anda',
    about_description:
      'Setiap wajah memiliki karakter dan pesona unik. Niwayuliana Makeup Artist hadir dengan pendekatan riasan yang ringan di kulit, menyatu halus, dan tahan lama sepanjang acara.\n\nMelalui konsultasi warna kulit, konsep busana, dan kenyamanan pribadi Anda, setiap detail dirangkai agar hasil riasan tampak segar baik secara langsung maupun di depan kamera.',
    about_service_area: '',
    about_image_url: '/demo/about-mua.png',
    about_media_alt: 'Foto demo perlengkapan dan suasana kerja Niwayuliana Makeup Artist',
    about_media_focus_x: 50,
    about_media_focus_y: 45,
    about_media_zoom: 100,

    services_title: 'Sentuhan *terbaik* untuk setiap momen',
    services_subtitle:
      'Pilihan layanan riasan yang dirancang khusus untuk mendampingi momen penting Anda dengan hasil lembut dan menawan.',
    portfolio_title: 'Portofolio *Riasan*',
    portfolio_subtitle:
      'Inspirasi tampilan natural hingga soft glam yang dapat disesuaikan dengan karakter acara Anda.',
    testimonials_title: 'Cerita *Pelanggan*',
    testimonials_subtitle:
      'Kesan hangat dari para klien yang telah mempercayakan momen istimewanya bersama kami.',
    contact_title: 'Mari rencanakan *riasan* hari spesial Anda',
    contact_description:
      'Silakan hubungi kami untuk menanyakan ketersediaan tanggal, konsultasi konsep riasan, atau penyesuaian jadwal acara Anda.',

    whatsapp_number: '',
    whatsapp_default_message:
      'Halo Niwayuliana Makeup Artist, saya ingin berkonsultasi mengenai layanan makeup.',
    instagram_handle: '',
    instagram_url: '',
    email: '',
    address_or_area: '',
    operating_hours: '',
    extra_social_links: [],

    theme_blush: DEFAULT_THEME.theme_blush,
    theme_ivory: DEFAULT_THEME.theme_ivory,
    theme_accent: DEFAULT_THEME.theme_accent,
    theme_heading: DEFAULT_THEME.theme_heading,
    theme_body: DEFAULT_THEME.theme_body,
    font_preset: DEFAULT_THEME.font_preset,
    section_order: DEFAULT_THEME.section_order,
    section_visibility: DEFAULT_THEME.section_visibility,

    seo_title: 'Niwayuliana Makeup Artist — Riasan Natural & Elegan',
    seo_description:
      'Riasan profesional yang menonjolkan kecantikan alami, elegan, dan tahan lama untuk bridal, engagement, dan graduation.',
    seo_og_image_url: null,
    seo_og_alt: 'Niwayuliana Makeup Artist Soft Blush',
    site_copy: DEFAULT_SITE_COPY,
  },
  service_categories: [
    { id: 'demo-svc-cat-bridal', name: 'Bridal', slug: 'bridal', sort_order: 1 },
    { id: 'demo-svc-cat-engagement', name: 'Engagement', slug: 'engagement', sort_order: 2 },
    { id: 'demo-svc-cat-graduation', name: 'Graduation', slug: 'graduation', sort_order: 3 },
  ],
  services: [
    {
      id: 'demo-service-bridal',
      category_id: 'demo-svc-cat-bridal',
      name: 'Bridal Makeup',
      short_description:
        'Riasan pengantin yang halus, bercahaya alami, dan dirancang tahan lama dari akad hingga resepsi.',
      detail_description:
        'Paket riasan khusus hari pernikahan dengan persiapan kulit menyeluruh agar complexion menyatu sempurna, ringan, dan bebas crack sepanjang acara.\n\nTersedia konsultasi nuansa warna, detail riasan mata lembut, serta penyesuaian look untuk akad, pemberkatan, maupun resepsi.',
      highlights: [
        'Konsultasi konsep look & warna busana',
        'Skin prep menyeluruh agar makeup tahan lama',
        'Pemasangan bulu mata natural & touch-up kit',
      ],
      price_label: '',
      image_url: '/demo/service-bridal.png',
      image_alt: 'Foto demo layanan Bridal Makeup bernuansa Soft Blush',
      image_focus_x: 50,
      image_focus_y: 28,
      image_zoom: 100,
      sort_order: 1,
    },
    {
      id: 'demo-service-engagement',
      category_id: 'demo-svc-cat-engagement',
      name: 'Engagement',
      short_description:
        'Tampilan feminin yang manis dan segar untuk momen pertunangan atau lamaran yang hangat.',
      detail_description:
        'Riasan soft glam bernuansa rose dan peach yang mempertegas fitur wajah secara lembut tanpa terlihat berlebihan.\n\nCocok dipadukan dengan kebaya modern, gaun pastel, maupun busana adat bernuansa lembut.',
      highlights: [
        'Riasan soft glam bernuansa rose & peach',
        'Complexion ringan dan halus di kulit',
        'Bulu mata lembut & penataan aksen wajah',
      ],
      price_label: '',
      image_url: '/demo/service-engagement.png',
      image_alt: 'Foto demo layanan Engagement Makeup yang lembut dan anggun',
      image_focus_x: 50,
      image_focus_y: 28,
      image_zoom: 100,
      sort_order: 2,
    },
    {
      id: 'demo-service-graduation',
      category_id: 'demo-svc-cat-graduation',
      name: 'Graduation',
      short_description:
        'Riasan cerah natural dan rapi yang nyaman dikenakan sepanjang prosesi wisuda dan sesi foto.',
      detail_description:
        'Makeup ringan dengan hasil akhir segar dan fotogenik untuk hari kelulusan Anda.\n\nDirancang agar tetap nyaman di bawah cahaya studio maupun luar ruangan serta tahan lama hingga sesi foto keluarga selesai.',
      highlights: [
        'Makeup segar tahan lama untuk sesi foto',
        'Hasil akhir cerah natural & bebas cakey',
        'Penyesuaian warna sesuai kebaya atau toga',
      ],
      price_label: '',
      image_url: '/demo/service-graduation.png',
      image_alt: 'Foto demo layanan Graduation Makeup natural dan segar',
      image_focus_x: 50,
      image_focus_y: 28,
      image_zoom: 100,
      sort_order: 3,
    },
  ],
  portfolio_categories: [
    { id: 'demo-cat-bridal', name: 'Bridal Makeup', slug: 'bridal-makeup', sort_order: 1 },
    { id: 'demo-cat-engagement', name: 'Engagement', slug: 'engagement', sort_order: 2 },
    { id: 'demo-cat-graduation', name: 'Graduation', slug: 'graduation', sort_order: 3 },
  ],
  portfolio_items: [
    {
      id: 'demo-pf-1',
      category_id: 'demo-cat-bridal',
      title: 'Soft Luminous Bridal (Foto Demo)',
      alt_text: 'Foto demo portofolio riasan pengantin natural lembut',
      image_url: '/demo/service-bridal.png',
      image_focus_x: 50,
      image_focus_y: 28,
      image_zoom: 100,
      sort_order: 1,
    },
    {
      id: 'demo-pf-2',
      category_id: 'demo-cat-engagement',
      title: 'Rose Blush Engagement (Foto Demo)',
      alt_text: 'Foto demo portofolio riasan lamaran bernuansa rose lembut',
      image_url: '/demo/service-engagement.png',
      image_focus_x: 50,
      image_focus_y: 28,
      image_zoom: 100,
      sort_order: 2,
    },
    {
      id: 'demo-pf-3',
      category_id: 'demo-cat-graduation',
      title: 'Fresh Radiant Graduation (Foto Demo)',
      alt_text: 'Foto demo portofolio riasan wisuda segar dan natural',
      image_url: '/demo/service-graduation.png',
      image_focus_x: 50,
      image_focus_y: 28,
      image_zoom: 100,
      sort_order: 3,
    },
  ],
  testimonials: [],
};
