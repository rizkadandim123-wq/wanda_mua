import { apiJson } from './api';
import { DEFAULT_BRAND_LOGO_URL, normalizeSiteCopy } from './defaults';
import type {
  DraftBundle,
  PortfolioCategory,
  PortfolioItem,
  PublishedSnapshot,
  PublishReleaseMeta,
  ServiceCategory,
  ServiceItem,
  SiteCopy,
  SiteSettings,
  TestimonialItem,
} from '../types/cms';

export async function fetchPublishedSnapshot(): Promise<{
  snapshot: PublishedSnapshot;
  isConfigured: boolean;
}> {
  return apiJson<{ snapshot: PublishedSnapshot; isConfigured: boolean }>('/api/public/site');
}

export async function fetchDraftBundle(): Promise<DraftBundle> {
  return apiJson<DraftBundle>('/api/admin/draft');
}

export function buildDraftPreviewSnapshot(bundle: DraftBundle): PublishedSnapshot {
  const {
    settings,
    serviceCategories,
    services,
    categories,
    portfolioItems,
    testimonials,
    mediaUrls,
    latestPublish,
  } = bundle;

  const resolveDraftImg = (mediaId: string | null, demoUrl: string | null) => {
    if (mediaId && mediaUrls[mediaId]) return mediaUrls[mediaId];
    return demoUrl ?? null;
  };

  return {
    version_number: latestPublish?.version_number ?? 0,
    published_at: latestPublish?.published_at ?? null,
    settings: {
      business_name: settings.business_name,
      business_subtext: settings.business_subtext,
      business_tagline: settings.business_tagline,
      brand_display_mode: settings.brand_display_mode,
      logo_url: settings.logo_media_id
        ? (mediaUrls[settings.logo_media_id] ?? DEFAULT_BRAND_LOGO_URL)
        : DEFAULT_BRAND_LOGO_URL,
      favicon_url: settings.favicon_media_id
        ? (mediaUrls[settings.favicon_media_id] ?? null)
        : null,

      hero_title: settings.hero_title,
      hero_description: settings.hero_description,
      hero_cta_label: settings.hero_cta_label,
      hero_whatsapp_message: settings.hero_whatsapp_message,
      hero_primary_url: resolveDraftImg(
        settings.hero_primary_media_id,
        settings.hero_primary_demo_url
      ),
      hero_primary_alt: settings.hero_primary_alt,
      hero_primary_focus_x: settings.hero_primary_focus_x,
      hero_primary_focus_y: settings.hero_primary_focus_y,
      hero_primary_zoom: settings.hero_primary_zoom ?? 100,
      hero_secondary_url: resolveDraftImg(
        settings.hero_secondary_media_id,
        settings.hero_secondary_demo_url
      ),
      hero_secondary_alt: settings.hero_secondary_alt,
      hero_secondary_focus_x: settings.hero_secondary_focus_x,
      hero_secondary_focus_y: settings.hero_secondary_focus_y,
      hero_secondary_zoom: settings.hero_secondary_zoom ?? 100,

      about_title: settings.about_title,
      about_description: settings.about_description,
      about_service_area: settings.about_service_area,
      about_image_url: resolveDraftImg(settings.about_media_id, settings.about_demo_url),
      about_media_alt: settings.about_media_alt,
      about_media_focus_x: settings.about_media_focus_x,
      about_media_focus_y: settings.about_media_focus_y,
      about_media_zoom: settings.about_media_zoom ?? 100,

      services_title: settings.services_title,
      services_subtitle: settings.services_subtitle,
      portfolio_title: settings.portfolio_title,
      portfolio_subtitle: settings.portfolio_subtitle,
      testimonials_title: settings.testimonials_title,
      testimonials_subtitle: settings.testimonials_subtitle ?? '',
      contact_title: settings.contact_title,
      contact_description: settings.contact_description,

      whatsapp_number: settings.whatsapp_number,
      whatsapp_default_message: settings.whatsapp_default_message,
      instagram_handle: settings.instagram_handle,
      instagram_url: settings.instagram_url,
      email: settings.email,
      address_or_area: settings.address_or_area,
      operating_hours: settings.operating_hours,
      extra_social_links: settings.extra_social_links,

      theme_blush: settings.theme_blush,
      theme_ivory: settings.theme_ivory,
      theme_accent: settings.theme_accent,
      theme_heading: settings.theme_heading,
      theme_body: settings.theme_body,
      font_preset: settings.font_preset,
      section_order: settings.section_order,
      section_visibility: settings.section_visibility,

      seo_title: settings.seo_title,
      seo_description: settings.seo_description,
      seo_og_image_url: settings.seo_og_media_id
        ? (mediaUrls[settings.seo_og_media_id] ?? null)
        : null,
      seo_og_alt: settings.seo_og_alt,
      site_copy: normalizeSiteCopy(settings.site_copy),
    },
    service_categories: (serviceCategories ?? []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      sort_order: cat.sort_order,
    })),
    services: services
      .filter((item) => item.is_visible)
      .map((item) => ({
        id: item.id,
        category_id: item.category_id ?? null,
        name: item.name,
        short_description: item.short_description,
        detail_description: item.detail_description,
        highlights: Array.isArray(item.highlights) ? item.highlights : [],
        price_label: item.price_label,
        image_url: resolveDraftImg(item.media_id, item.fallback_demo_url),
        image_alt: item.image_alt,
        image_focus_x: item.image_focus_x,
        image_focus_y: item.image_focus_y,
        image_zoom: item.image_zoom ?? 100,
        sort_order: item.sort_order,
      })),
    portfolio_categories: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      sort_order: cat.sort_order,
    })),
    portfolio_items: portfolioItems
      .filter((item) => item.is_visible)
      .map((item) => ({
        id: item.id,
        category_id: item.category_id,
        title: item.title,
        alt_text: item.alt_text,
        image_url: resolveDraftImg(item.media_id, item.fallback_demo_url),
        image_focus_x: item.image_focus_x,
        image_focus_y: item.image_focus_y,
        image_zoom: item.image_zoom ?? 100,
        sort_order: item.sort_order,
      })),
    testimonials: testimonials
      .filter((item) => item.is_visible)
      .map((item) => ({
        id: item.id,
        client_name: item.client_name,
        quote: item.quote,
        rating: item.rating ?? 5,
        sort_order: item.sort_order,
      })),
  };
}

export async function updateSiteSettings(
  patch: Partial<Omit<SiteSettings, 'site_copy'>> & { site_copy?: Partial<SiteCopy> }
): Promise<SiteSettings> {
  return apiJson<SiteSettings>('/api/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function upsertServiceCategory(input: {
  id?: string;
  name: string;
  sort_order?: number;
}): Promise<ServiceCategory> {
  if (input.id) {
    return apiJson<ServiceCategory>(`/api/admin/service-categories/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }
  return apiJson<ServiceCategory>('/api/admin/service-categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteServiceCategoryWithReassign(
  categoryId: string,
  targetCategoryId: string | null
): Promise<void> {
  await apiJson<{ ok: true }>(`/api/admin/service-categories/${categoryId}`, {
    method: 'DELETE',
    body: JSON.stringify({ targetCategoryId }),
  });
}

export async function reorderServiceCategories(orderedIds: string[]): Promise<void> {
  await apiJson<{ ok: true }>('/api/admin/service-categories/reorder', {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  });
}

export async function upsertService(
  input: Partial<ServiceItem> & { id?: string; name: string }
): Promise<ServiceItem> {
  if (input.id) {
    return apiJson<ServiceItem>(`/api/admin/services/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }
  return apiJson<ServiceItem>('/api/admin/services', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteService(id: string): Promise<void> {
  await apiJson<{ ok: true }>(`/api/admin/services/${id}`, { method: 'DELETE' });
}

export async function reorderServices(orderedIds: string[]): Promise<void> {
  await apiJson<{ ok: true }>('/api/admin/services/reorder', {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  });
}

export async function upsertCategory(input: {
  id?: string;
  name: string;
  sort_order?: number;
}): Promise<PortfolioCategory> {
  if (input.id) {
    return apiJson<PortfolioCategory>(`/api/admin/categories/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }
  return apiJson<PortfolioCategory>('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteCategoryWithReassign(
  categoryId: string,
  targetCategoryId: string | null
): Promise<void> {
  await apiJson<{ ok: true }>(`/api/admin/categories/${categoryId}`, {
    method: 'DELETE',
    body: JSON.stringify({ targetCategoryId }),
  });
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  await apiJson<{ ok: true }>('/api/admin/categories/reorder', {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  });
}

export async function createPortfolioItems(
  items: Array<{
    category_id: string;
    title: string;
    alt_text: string;
    media_id: string | null;
    fallback_demo_url?: string | null;
    image_focus_x?: number;
    image_focus_y?: number;
    image_zoom?: number;
    sort_order: number;
    is_visible: boolean;
  }>
): Promise<PortfolioItem[]> {
  return apiJson<PortfolioItem[]>('/api/admin/portfolio', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function updatePortfolioItem(
  id: string,
  patch: Partial<PortfolioItem>
): Promise<PortfolioItem> {
  return apiJson<PortfolioItem>(`/api/admin/portfolio/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deletePortfolioItem(id: string): Promise<void> {
  await apiJson<{ ok: true }>(`/api/admin/portfolio/${id}`, { method: 'DELETE' });
}

export async function reorderPortfolioItems(orderedIds: string[]): Promise<void> {
  await apiJson<{ ok: true }>('/api/admin/portfolio/reorder', {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  });
}

export async function upsertTestimonial(
  input: Partial<TestimonialItem> & { id?: string; client_name: string; quote: string }
): Promise<TestimonialItem> {
  if (input.id) {
    return apiJson<TestimonialItem>(`/api/admin/testimonials/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }
  return apiJson<TestimonialItem>('/api/admin/testimonials', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteTestimonial(id: string): Promise<void> {
  await apiJson<{ ok: true }>(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
}

export async function reorderTestimonials(orderedIds: string[]): Promise<void> {
  await apiJson<{ ok: true }>('/api/admin/testimonials/reorder', {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  });
}

export async function publishAllDraftChanges(): Promise<PublishReleaseMeta> {
  return apiJson<PublishReleaseMeta>('/api/admin/publish', { method: 'POST' });
}

export type { PublishReleaseMeta };
