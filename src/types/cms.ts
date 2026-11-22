export type BrandDisplayMode = 'logo' | 'text' | 'both';

export type SectionKey = 'services' | 'about' | 'portfolio' | 'testimonials' | 'contact';

export type FontPresetKey =
  | 'cormorant-jakarta'
  | 'playfair-dm'
  | 'lora-nunito'
  | 'fraunces-inter';

export interface ExtraSocialLink {
  id: string;
  label: string;
  url: string;
}

export interface WhatsAppQuickPreset {
  label: string;
  text: string;
}

export interface SiteCopy {
  hero_secondary_cta_label: string;
  hero_badge_text: string;
  hero_detail_caption: string;

  services_eyebrow: string;
  about_eyebrow: string;
  portfolio_eyebrow: string;
  testimonials_eyebrow: string;

  contact_eyebrow: string;
  contact_cta_label: string;
  contact_note: string;
  contact_card_eyebrow: string;
  contact_card_title: string;

  feedback_visible: boolean;
  feedback_eyebrow: string;
  feedback_title: string;
  feedback_subtitle: string;
  feedback_topics: string[];
  feedback_submit_label: string;
  feedback_note: string;
  feedback_success_title: string;
  feedback_success_message: string;

  wa_widget_subtitle: string;
  wa_widget_greeting: string;
  wa_widget_button_label: string;
  wa_widget_presets: WhatsAppQuickPreset[];
}

export interface MediaAsset {
  id: string;
  storage_bucket: 'r2' | 'cms-private' | 'cms-public';
  storage_path: string;
  public_path: string | null;
  original_filename: string;
  mime_type: 'image/jpeg' | 'image/png' | 'image/webp';
  size_bytes: number;
  alt_text: string;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  business_name: string;
  business_subtext: string;
  business_tagline: string;
  brand_display_mode: BrandDisplayMode;
  logo_media_id: string | null;
  favicon_media_id: string | null;

  hero_title: string;
  hero_description: string;
  hero_cta_label: string;
  hero_whatsapp_message: string;
  hero_primary_media_id: string | null;
  hero_primary_demo_url: string | null;
  hero_primary_alt: string;
  hero_primary_focus_x: number;
  hero_primary_focus_y: number;
  hero_primary_zoom: number;
  hero_secondary_media_id: string | null;
  hero_secondary_demo_url: string | null;
  hero_secondary_alt: string;
  hero_secondary_focus_x: number;
  hero_secondary_focus_y: number;
  hero_secondary_zoom: number;

  about_title: string;
  about_description: string;
  about_service_area: string;
  about_media_id: string | null;
  about_demo_url: string | null;
  about_media_alt: string;
  about_media_focus_x: number;
  about_media_focus_y: number;
  about_media_zoom: number;

  services_title: string;
  services_subtitle: string;
  portfolio_title: string;
  portfolio_subtitle: string;
  testimonials_title: string;
  testimonials_subtitle: string;
  contact_title: string;
  contact_description: string;

  whatsapp_number: string;
  whatsapp_default_message: string;
  instagram_handle: string;
  instagram_url: string;
  email: string;
  address_or_area: string;
  operating_hours: string;
  extra_social_links: ExtraSocialLink[];

  theme_blush: string;
  theme_ivory: string;
  theme_accent: string;
  theme_heading: string;
  theme_body: string;
  font_preset: FontPresetKey;
  section_order: SectionKey[];
  section_visibility: Record<SectionKey, boolean>;

  seo_title: string;
  seo_description: string;
  seo_og_media_id: string | null;
  seo_og_alt: string;
  site_copy: SiteCopy;

  draft_version: number;
  updated_at: string;
  updated_by: string | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  id: string;
  category_id: string | null;
  name: string;
  short_description: string;
  detail_description: string;
  highlights: string[];
  price_label: string;
  media_id: string | null;
  fallback_demo_url: string | null;
  image_alt: string;
  image_focus_x: number;
  image_focus_y: number;
  image_zoom: number;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  category_id: string;
  title: string;
  alt_text: string;
  media_id: string | null;
  fallback_demo_url: string | null;
  image_focus_x: number;
  image_focus_y: number;
  image_zoom: number;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestimonialItem {
  id: string;
  client_name: string;
  quote: string;
  rating: number;
  media_id: string | null;
  image_alt: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublishedServiceCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface PublishedService {
  id: string;
  category_id: string | null;
  name: string;
  short_description: string;
  detail_description: string;
  highlights: string[];
  price_label: string;
  image_url: string | null;
  image_alt: string;
  image_focus_x: number;
  image_focus_y: number;
  image_zoom: number;
  sort_order: number;
}

export interface PublishedCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface PublishedPortfolioItem {
  id: string;
  category_id: string;
  title: string;
  alt_text: string;
  image_url: string | null;
  image_focus_x: number;
  image_focus_y: number;
  image_zoom: number;
  sort_order: number;
}

export interface PublishedTestimonial {
  id: string;
  client_name: string;
  quote: string;
  rating: number;
  sort_order: number;
}

export interface PublishedSettings {
  business_name: string;
  business_subtext: string;
  business_tagline: string;
  brand_display_mode: BrandDisplayMode;
  logo_url: string | null;
  favicon_url: string | null;

  hero_title: string;
  hero_description: string;
  hero_cta_label: string;
  hero_whatsapp_message: string;
  hero_primary_url: string | null;
  hero_primary_alt: string;
  hero_primary_focus_x: number;
  hero_primary_focus_y: number;
  hero_primary_zoom: number;
  hero_secondary_url: string | null;
  hero_secondary_alt: string;
  hero_secondary_focus_x: number;
  hero_secondary_focus_y: number;
  hero_secondary_zoom: number;

  about_title: string;
  about_description: string;
  about_service_area: string;
  about_image_url: string | null;
  about_media_alt: string;
  about_media_focus_x: number;
  about_media_focus_y: number;
  about_media_zoom: number;

  services_title: string;
  services_subtitle: string;
  portfolio_title: string;
  portfolio_subtitle: string;
  testimonials_title: string;
  testimonials_subtitle: string;
  contact_title: string;
  contact_description: string;

  whatsapp_number: string;
  whatsapp_default_message: string;
  instagram_handle: string;
  instagram_url: string;
  email: string;
  address_or_area: string;
  operating_hours: string;
  extra_social_links: ExtraSocialLink[];

  theme_blush: string;
  theme_ivory: string;
  theme_accent: string;
  theme_heading: string;
  theme_body: string;
  font_preset: FontPresetKey;
  section_order: SectionKey[];
  section_visibility: Record<SectionKey, boolean>;

  seo_title: string;
  seo_description: string;
  seo_og_image_url: string | null;
  seo_og_alt: string;
  site_copy: SiteCopy;
}

export interface PublishedSnapshot {
  version_number: number;
  published_at: string | null;
  settings: PublishedSettings;
  service_categories: PublishedServiceCategory[];
  services: PublishedService[];
  portfolio_categories: PublishedCategory[];
  portfolio_items: PublishedPortfolioItem[];
  testimonials: PublishedTestimonial[];
}

export interface PublishReleaseMeta {
  id: string;
  version_number: number;
  draft_version_published: number;
  published_at: string;
}

export interface DraftBundle {
  settings: SiteSettings;
  serviceCategories: ServiceCategory[];
  services: ServiceItem[];
  categories: PortfolioCategory[];
  portfolioItems: PortfolioItem[];
  testimonials: TestimonialItem[];
  latestPublish: PublishReleaseMeta | null;
  mediaUrls: Record<string, string>;
  mediaAssets: Record<string, MediaAsset>;
}

export interface PublishStatus {
  hasUnpublishedChanges: boolean;
  draftVersion: number;
  publishedDraftVersion: number | null;
  publishedReleaseNumber: number | null;
  publishedAt: string | null;
}
