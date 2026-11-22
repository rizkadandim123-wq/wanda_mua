import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  DEFAULT_DEMO_SNAPSHOT,
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
  normalizeSiteCopy,
} from '../src/lib/defaults';
import { slugify, validateImageFile } from '../src/lib/validation';
import {
  DAYMOMENT_WEBSITE_URL,
  normalizeDaymomentTemplates,
} from '../src/lib/partnerService';
import type {
  ExtraSocialLink,
  FontPresetKey,
  MediaAsset,
  PortfolioCategory,
  PortfolioItem,
  PublishedSnapshot,
  SectionKey,
  ServiceCategory,
  ServiceItem,
  SiteSettings,
  TestimonialItem,
} from '../src/types/cms';
import {
  buildClearSessionCookie,
  buildSessionCookie,
  createSessionToken,
  readCookie,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from './session';
import type { AdminProfileSession, R2BucketLike, ServerEnv } from './types';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function inferMimeFromKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function isSafePublicMediaKey(key: string): boolean {
  return /^public\/[a-zA-Z0-9/_.-]+$/.test(key) && !key.includes('..');
}

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.set(key, value);
    }
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function getSupabaseClients(env: ServerEnv): {
  configured: boolean;
  url: string;
  service: SupabaseClient | null;
  publicClient: SupabaseClient | null;
} {
  const url = env.SUPABASE_URL?.trim() ?? '';
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';
  const publishableKey = env.SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

  if (!url || !serviceKey) {
    return { configured: false, url, service: null, publicClient: null };
  }

  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const publicClient = publishableKey
    ? createClient(url, publishableKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : service;

  return { configured: true, url, service, publicClient };
}

function requireR2Bucket(env: ServerEnv): R2BucketLike {
  if (!env.MEDIA_BUCKET) {
    throw new HttpError(
      503,
      'Binding R2 MEDIA_BUCKET belum dikonfigurasi pada Cloudflare.'
    );
  }
  return env.MEDIA_BUCKET;
}

function resolvePublicMediaUrl(env: ServerEnv, publicPath: string): string {
  const base = env.R2_PUBLIC_URL?.trim().replace(/\/+$/, '');
  if (base) {
    return `${base}/${publicPath.replace(/^\/+/, '')}`;
  }
  return `/api/media/${publicPath.replace(/^\/+/, '')}`;
}

function resolveSnapshotImage(
  env: ServerEnv,
  publicPath: unknown,
  fallbackDemoUrl: unknown
): string | null {
  if (typeof publicPath === 'string' && publicPath.length > 0) {
    return resolvePublicMediaUrl(env, publicPath);
  }
  if (typeof fallbackDemoUrl === 'string' && fallbackDemoUrl.length > 0) {
    return fallbackDemoUrl;
  }
  return null;
}

function normalizeSectionOrder(raw: unknown): SectionKey[] {
  const valid = new Set<SectionKey>(DEFAULT_SECTION_ORDER);
  if (!Array.isArray(raw)) return [...DEFAULT_SECTION_ORDER];
  const filtered = raw.filter((item): item is SectionKey => valid.has(item as SectionKey));
  for (const key of DEFAULT_SECTION_ORDER) {
    if (!filtered.includes(key)) filtered.push(key);
  }
  return filtered;
}

function normalizeSectionVisibility(raw: unknown): Record<SectionKey, boolean> {
  const result = { ...DEFAULT_SECTION_VISIBILITY };
  if (raw && typeof raw === 'object') {
    for (const key of DEFAULT_SECTION_ORDER) {
      const val = (raw as Record<string, unknown>)[key];
      if (typeof val === 'boolean') result[key] = val;
    }
  }
  return result;
}

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeExtraSocials(raw: unknown): ExtraSocialLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is ExtraSocialLink => {
      return (
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as ExtraSocialLink).label === 'string' &&
        typeof (item as ExtraSocialLink).url === 'string'
      );
    })
    .map((item, idx) => ({
      id: item.id || `social-${idx}`,
      label: item.label,
      url: item.url,
    }));
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, 'Format body JSON tidak valid.');
  }
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function requireAdmin(
  request: Request,
  env: ServerEnv,
  service: SupabaseClient
): Promise<AdminProfileSession> {
  const token = readCookie(request, SESSION_COOKIE_NAME);
  if (!token) {
    throw new HttpError(401, 'Sesi admin tidak ditemukan. Silakan login terlebih dahulu.');
  }

  const payload = await verifySessionToken(token, env);
  if (!payload) {
    throw new HttpError(401, 'Sesi admin sudah berakhir atau tidak valid. Silakan login ulang.');
  }

  const { data: profile, error } = await service
    .from('profiles')
    .select('id, username, display_name, role, is_active')
    .eq('id', payload.id)
    .maybeSingle();

  if (error || !profile || !profile.is_active) {
    throw new HttpError(401, 'Akun admin tidak aktif atau tidak ditemukan.');
  }

  return {
    id: String(profile.id),
    username: String(profile.username),
    display_name: String(profile.display_name),
    role: profile.role === 'owner' ? 'owner' : 'admin',
  };
}

function isHttpsRequest(request: Request): boolean {
  const url = new URL(request.url);
  if (url.protocol === 'https:') return true;
  return request.headers.get('x-forwarded-proto') === 'https';
}

export async function handleApiRequest(request: Request, env: ServerEnv): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();
  const https = isHttpsRequest(request);

  const { configured, service, publicClient } = getSupabaseClients(env);

  try {
    // -------------------------------------------------------------------------
    // 0. Endpoint Media Publik R2 (hanya mengizinkan prefix public/)
    // -------------------------------------------------------------------------
    if (method === 'GET' && path.startsWith('/api/media/')) {
      const key = decodeURIComponent(path.slice('/api/media/'.length));
      if (!isSafePublicMediaKey(key)) {
        return jsonResponse({ error: 'Akses ke file media ini ditolak.' }, 403);
      }

      const bucket = requireR2Bucket(env);
      const obj = await bucket.get(key);
      if (!obj) {
        return jsonResponse({ error: 'File media tidak ditemukan.' }, 404);
      }

      const bytes = await obj.arrayBuffer();
      const contentType = obj.httpMetadata?.contentType || inferMimeFromKey(key);
      return new Response(bytes, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // -------------------------------------------------------------------------
    // 1. Endpoint Publik: Konten Website Aktif
    // -------------------------------------------------------------------------
    if (method === 'GET' && path === '/api/public/site') {
      if (!configured || !publicClient) {
        return jsonResponse({ isConfigured: false, snapshot: DEFAULT_DEMO_SNAPSHOT });
      }

      const { data, error } = await publicClient
        .from('published_releases')
        .select('version_number, published_at, snapshot')
        .eq('is_current', true)
        .maybeSingle();

      if (error) {
        throw new HttpError(500, `Gagal memuat konten website: ${error.message}`);
      }

      if (!data || !data.snapshot) {
        return jsonResponse({ isConfigured: true, snapshot: DEFAULT_DEMO_SNAPSHOT });
      }

      const raw = data.snapshot as {
        settings: Record<string, unknown>;
        service_categories?: Array<Record<string, unknown>>;
        services: Array<Record<string, unknown>>;
        portfolio_categories: Array<Record<string, unknown>>;
        portfolio_items: Array<Record<string, unknown>>;
        testimonials: Array<Record<string, unknown>>;
      };

      const s = raw.settings ?? {};
      const def = DEFAULT_DEMO_SNAPSHOT.settings;

      const snapshot: PublishedSnapshot = {
        version_number: Number(data.version_number ?? 1),
        published_at: data.published_at ? String(data.published_at) : null,
        settings: {
          business_name: String(s.business_name ?? def.business_name),
          business_subtext: String(s.business_subtext ?? def.business_subtext),
          business_tagline: String(s.business_tagline ?? def.business_tagline),
          brand_display_mode:
            s.brand_display_mode === 'logo' ||
            s.brand_display_mode === 'text' ||
            s.brand_display_mode === 'both'
              ? s.brand_display_mode
              : 'both',
          logo_url: resolveSnapshotImage(env, s.logo_public_path, '/logo-niwa.png'),
          favicon_url: resolveSnapshotImage(env, s.favicon_public_path, null),

          hero_title: String(s.hero_title ?? def.hero_title),
          hero_description: String(s.hero_description ?? def.hero_description),
          hero_cta_label: String(s.hero_cta_label ?? def.hero_cta_label),
          hero_whatsapp_message: String(s.hero_whatsapp_message ?? def.hero_whatsapp_message),
          hero_primary_url: resolveSnapshotImage(
            env,
            s.hero_primary_public_path,
            s.hero_primary_demo_url
          ),
          hero_primary_alt: String(s.hero_primary_alt ?? def.hero_primary_alt),
          hero_primary_focus_x: Number(s.hero_primary_focus_x ?? 50),
          hero_primary_focus_y: Number(s.hero_primary_focus_y ?? 26),
          hero_primary_zoom: Number(s.hero_primary_zoom ?? 100),
          hero_secondary_url: resolveSnapshotImage(
            env,
            s.hero_secondary_public_path,
            s.hero_secondary_demo_url
          ),
          hero_secondary_alt: String(s.hero_secondary_alt ?? def.hero_secondary_alt),
          hero_secondary_focus_x: Number(s.hero_secondary_focus_x ?? 50),
          hero_secondary_focus_y: Number(s.hero_secondary_focus_y ?? 50),
          hero_secondary_zoom: Number(s.hero_secondary_zoom ?? 100),

          about_title: String(s.about_title ?? def.about_title),
          about_description: String(s.about_description ?? def.about_description),
          about_service_area: String(s.about_service_area ?? ''),
          about_image_url: resolveSnapshotImage(env, s.about_public_path, s.about_demo_url),
          about_media_alt: String(s.about_media_alt ?? def.about_media_alt),
          about_media_focus_x: Number(s.about_media_focus_x ?? 50),
          about_media_focus_y: Number(s.about_media_focus_y ?? 45),
          about_media_zoom: Number(s.about_media_zoom ?? 100),

          services_title: String(s.services_title ?? def.services_title),
          services_subtitle: String(s.services_subtitle ?? def.services_subtitle),
          portfolio_title: String(s.portfolio_title ?? def.portfolio_title),
          portfolio_subtitle: String(s.portfolio_subtitle ?? def.portfolio_subtitle),
          testimonials_title: String(s.testimonials_title ?? def.testimonials_title),
          testimonials_subtitle: String(s.testimonials_subtitle ?? def.testimonials_subtitle),
          contact_title: String(s.contact_title ?? def.contact_title),
          contact_description: String(s.contact_description ?? def.contact_description),

          whatsapp_number: String(s.whatsapp_number ?? ''),
          whatsapp_default_message: String(s.whatsapp_default_message ?? ''),
          instagram_handle: String(s.instagram_handle ?? ''),
          instagram_url: String(s.instagram_url ?? ''),
          email: String(s.email ?? ''),
          address_or_area: String(s.address_or_area ?? ''),
          operating_hours: String(s.operating_hours ?? ''),
          extra_social_links: normalizeExtraSocials(s.extra_social_links),

          theme_blush: String(s.theme_blush ?? def.theme_blush),
          theme_ivory: String(s.theme_ivory ?? def.theme_ivory),
          theme_accent: String(s.theme_accent ?? def.theme_accent),
          theme_heading: String(s.theme_heading ?? def.theme_heading),
          theme_body: String(s.theme_body ?? def.theme_body),
          font_preset: (s.font_preset as FontPresetKey) ?? def.font_preset,
          section_order: normalizeSectionOrder(s.section_order),
          section_visibility: normalizeSectionVisibility(s.section_visibility),

          seo_title: String(s.seo_title ?? def.seo_title),
          seo_description: String(s.seo_description ?? def.seo_description),
          seo_og_image_url: resolveSnapshotImage(env, s.seo_og_public_path, null),
          seo_og_alt: String(s.seo_og_alt ?? def.seo_og_alt),
          site_copy: normalizeSiteCopy(s.site_copy),
        },
        service_categories: (raw.service_categories ?? []).map((cat) => ({
          id: String(cat.id),
          name: String(cat.name ?? ''),
          slug: String(cat.slug ?? ''),
          sort_order: Number(cat.sort_order ?? 0),
        })),
        services: (raw.services ?? []).map((item) => ({
          id: String(item.id),
          category_id: item.category_id ? String(item.category_id) : null,
          name: String(item.name ?? ''),
          short_description: String(item.short_description ?? ''),
          detail_description: String(item.detail_description ?? ''),
          highlights: normalizeStringArray(item.highlights),
          price_label: String(item.price_label ?? ''),
          image_url: resolveSnapshotImage(env, item.public_path, item.fallback_demo_url),
          image_alt: String(item.image_alt ?? ''),
          image_focus_x: Number(item.image_focus_x ?? 50),
          image_focus_y: Number(item.image_focus_y ?? 30),
          image_zoom: Number(item.image_zoom ?? 100),
          sort_order: Number(item.sort_order ?? 0),
        })),
        portfolio_categories: (raw.portfolio_categories ?? []).map((cat) => ({
          id: String(cat.id),
          name: String(cat.name ?? ''),
          slug: String(cat.slug ?? ''),
          sort_order: Number(cat.sort_order ?? 0),
        })),
        portfolio_items: (raw.portfolio_items ?? []).map((item) => ({
          id: String(item.id),
          category_id: String(item.category_id),
          title: String(item.title ?? ''),
          alt_text: String(item.alt_text ?? ''),
          image_url: resolveSnapshotImage(env, item.public_path, item.fallback_demo_url),
          image_focus_x: Number(item.image_focus_x ?? 50),
          image_focus_y: Number(item.image_focus_y ?? 35),
          image_zoom: Number(item.image_zoom ?? 100),
          sort_order: Number(item.sort_order ?? 0),
        })),
        testimonials: (raw.testimonials ?? []).map((item) => ({
          id: String(item.id),
          client_name: String(item.client_name ?? ''),
          quote: String(item.quote ?? ''),
          rating: Math.min(5, Math.max(1, Number(item.rating ?? 5))),
          sort_order: Number(item.sort_order ?? 0),
        })),
      };

      return jsonResponse({ isConfigured: true, snapshot });
    }

    // -------------------------------------------------------------------------
    // 1b. Endpoint Publik: Katalog Template Partner Kolaborasi (Daymoment)
    // -------------------------------------------------------------------------
    if (method === 'GET' && path === '/api/public/partner/daymoment') {
      try {
        const upstreamRes = await fetch(`${DAYMOMENT_WEBSITE_URL}/api/templates`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Niwayuliana-Partner-Integration/1.0',
          },
        });

        if (!upstreamRes.ok) {
          return jsonResponse(
            {
              ok: false,
              partner: { name: 'Daymoment', website: DAYMOMENT_WEBSITE_URL },
              templates: [],
              error: `Katalog template Daymoment sedang tidak dapat dimuat (HTTP ${upstreamRes.status}).`,
            },
            502
          );
        }

        const upstreamJson = (await upstreamRes.json().catch(() => null)) as {
          ok?: boolean;
          templates?: unknown;
        } | null;

        const templates = normalizeDaymomentTemplates(upstreamJson?.templates);
        return jsonResponse(
          {
            ok: true,
            partner: { name: 'Daymoment', website: DAYMOMENT_WEBSITE_URL },
            templates,
          },
          200,
          { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' }
        );
      } catch {
        return jsonResponse(
          {
            ok: false,
            partner: { name: 'Daymoment', website: DAYMOMENT_WEBSITE_URL },
            templates: [],
            error: 'Katalog template Daymoment sedang tidak dapat dimuat.',
          },
          502
        );
      }
    }

    // -------------------------------------------------------------------------
    // 2. Endpoint Autentikasi Admin (Tabel public.profiles)
    // -------------------------------------------------------------------------
    if (method === 'GET' && path === '/api/auth/session') {
      if (!configured || !service) {
        return jsonResponse({ isConfigured: false, hasAdmin: false, admin: null });
      }

      const { data: hasAdminData, error: hasAdminError } = await service.rpc('has_admin_profile');
      if (hasAdminError) {
        throw new HttpError(
          500,
          `Gagal memeriksa tabel profiles Supabase: ${hasAdminError.message}`
        );
      }

      const hasAdmin = Boolean(hasAdminData);
      let admin: AdminProfileSession | null = null;

      try {
        admin = await requireAdmin(request, env, service);
      } catch {
        admin = null;
      }

      return jsonResponse({ isConfigured: true, hasAdmin, admin });
    }

    if (method === 'POST' && path === '/api/auth/setup') {
      if (!configured || !service) {
        throw new HttpError(503, 'Supabase belum dikonfigurasi pada server.');
      }

      const body = await parseJsonBody<{
        username?: string;
        password?: string;
        displayName?: string;
      }>(request);

      const { data, error } = await service.rpc('create_initial_admin_profile', {
        p_username: body.username ?? '',
        p_password: body.password ?? '',
        p_display_name: body.displayName ?? 'Admin Niwayuliana',
      });

      if (error || !data) {
        throw new HttpError(400, error?.message ?? 'Gagal membuat akun admin pertama.');
      }

      const profile = data as AdminProfileSession;
      const token = await createSessionToken(profile, env);

      return jsonResponse(
        { admin: profile },
        201,
        { 'Set-Cookie': buildSessionCookie(token, https) }
      );
    }

    if (method === 'POST' && path === '/api/auth/login') {
      if (!configured || !service) {
        throw new HttpError(503, 'Supabase belum dikonfigurasi pada server.');
      }

      const body = await parseJsonBody<{ username?: string; password?: string }>(request);
      const { data, error } = await service.rpc('verify_admin_login', {
        p_username: body.username ?? '',
        p_password: body.password ?? '',
      });

      if (error) {
        throw new HttpError(500, `Gagal memverifikasi login: ${error.message}`);
      }

      if (!data) {
        throw new HttpError(401, 'Username atau kata sandi tidak sesuai.');
      }

      const profile = data as AdminProfileSession;
      const token = await createSessionToken(profile, env);

      return jsonResponse(
        { admin: profile },
        200,
        { 'Set-Cookie': buildSessionCookie(token, https) }
      );
    }

    if (method === 'POST' && path === '/api/auth/logout') {
      return jsonResponse(
        { ok: true },
        200,
        { 'Set-Cookie': buildClearSessionCookie(https) }
      );
    }

    if (method === 'POST' && path === '/api/auth/password') {
      if (!configured || !service) {
        throw new HttpError(503, 'Supabase belum dikonfigurasi pada server.');
      }

      const admin = await requireAdmin(request, env, service);
      const body = await parseJsonBody<{
        currentPassword?: string;
        newPassword?: string;
      }>(request);

      const { error } = await service.rpc('update_admin_password', {
        p_profile_id: admin.id,
        p_current_password: body.currentPassword ?? '',
        p_new_password: body.newPassword ?? '',
      });

      if (error) {
        throw new HttpError(400, error.message);
      }

      return jsonResponse({ ok: true });
    }

    // -------------------------------------------------------------------------
    // 3. Semua Route di bawah ini WAJIB terautentikasi sebagai admin
    // -------------------------------------------------------------------------
    if (!path.startsWith('/api/admin/')) {
      return jsonResponse({ error: 'Endpoint tidak ditemukan.' }, 404);
    }

    if (!configured || !service) {
      throw new HttpError(503, 'Supabase belum dikonfigurasi pada server.');
    }

    const admin = await requireAdmin(request, env, service);

    // GET /api/admin/media/:id (Baca file draft privat R2 khusus admin)
    const adminMediaMatch = path.match(/^\/api\/admin\/media\/([^/]+)$/);
    if (method === 'GET' && adminMediaMatch) {
      const assetId = adminMediaMatch[1];
      const { data: asset, error: assetErr } = await service
        .from('media_assets')
        .select('storage_path, mime_type')
        .eq('id', assetId)
        .maybeSingle();

      if (assetErr || !asset) {
        return jsonResponse({ error: 'Aset media draft tidak ditemukan.' }, 404);
      }

      const bucket = requireR2Bucket(env);
      const obj = await bucket.get(String(asset.storage_path));
      if (!obj) {
        return jsonResponse({ error: 'File media draft tidak ditemukan di R2.' }, 404);
      }

      return new Response(await obj.arrayBuffer(), {
        status: 200,
        headers: {
          'Content-Type': String(asset.mime_type || inferMimeFromKey(String(asset.storage_path))),
          'Cache-Control': 'private, no-store',
        },
      });
    }

    // GET /api/admin/draft
    if (method === 'GET' && path === '/api/admin/draft') {
      const [
        settingsRes,
        serviceCatsRes,
        servicesRes,
        categoriesRes,
        portfolioRes,
        testimonialsRes,
        publishRes,
      ] = await Promise.all([
        service.from('site_settings').select('*').eq('id', 1).single(),
        service
          .from('service_categories')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        service
          .from('services')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        service
          .from('portfolio_categories')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        service
          .from('portfolio_items')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        service
          .from('testimonials')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        service
          .from('published_releases')
          .select('id, version_number, draft_version_published, published_at')
          .eq('is_current', true)
          .maybeSingle(),
      ]);

      if (settingsRes.error) {
        throw new HttpError(500, `Gagal memuat site_settings: ${settingsRes.error.message}`);
      }
      if (serviceCatsRes.error) {
        throw new HttpError(
          500,
          `Gagal memuat kategori layanan: ${serviceCatsRes.error.message}`
        );
      }
      if (servicesRes.error) {
        throw new HttpError(500, `Gagal memuat layanan: ${servicesRes.error.message}`);
      }
      if (categoriesRes.error) {
        throw new HttpError(500, `Gagal memuat kategori: ${categoriesRes.error.message}`);
      }
      if (portfolioRes.error) {
        throw new HttpError(500, `Gagal memuat portofolio: ${portfolioRes.error.message}`);
      }
      if (testimonialsRes.error) {
        throw new HttpError(500, `Gagal memuat testimoni: ${testimonialsRes.error.message}`);
      }

      const rawSettings = settingsRes.data as SiteSettings;
      const settings: SiteSettings = {
        ...rawSettings,
        testimonials_subtitle: rawSettings.testimonials_subtitle ?? '',
        extra_social_links: normalizeExtraSocials(rawSettings.extra_social_links),
        section_order: normalizeSectionOrder(rawSettings.section_order),
        section_visibility: normalizeSectionVisibility(rawSettings.section_visibility),
        site_copy: normalizeSiteCopy(rawSettings.site_copy),
      };

      const serviceCategories = (serviceCatsRes.data ?? []) as ServiceCategory[];
      const services = ((servicesRes.data ?? []) as ServiceItem[]).map((item) => ({
        ...item,
        category_id: item.category_id ?? null,
        highlights: normalizeStringArray(item.highlights),
      }));
      const categories = (categoriesRes.data ?? []) as PortfolioCategory[];
      const portfolioItems = (portfolioRes.data ?? []) as PortfolioItem[];
      const testimonials = ((testimonialsRes.data ?? []) as TestimonialItem[]).map((item) => ({
        ...item,
        rating: Math.min(5, Math.max(1, Number(item.rating ?? 5))),
      }));
      const latestPublish = publishRes.data ?? null;

      const mediaIds = Array.from(
        new Set(
          [
            settings.logo_media_id,
            settings.favicon_media_id,
            settings.hero_primary_media_id,
            settings.hero_secondary_media_id,
            settings.about_media_id,
            settings.seo_og_media_id,
            ...services.map((s) => s.media_id),
            ...portfolioItems.map((p) => p.media_id),
          ].filter((id): id is string => typeof id === 'string' && id.length > 0)
        )
      );

      const mediaAssets: Record<string, MediaAsset> = {};
      const mediaUrls: Record<string, string> = {};

      if (mediaIds.length > 0) {
        const { data: assetRows, error: assetError } = await service
          .from('media_assets')
          .select('*')
          .in('id', mediaIds);

        if (assetError) {
          throw new HttpError(500, `Gagal memuat media draft: ${assetError.message}`);
        }

        for (const asset of (assetRows ?? []) as MediaAsset[]) {
          mediaAssets[asset.id] = asset;
          mediaUrls[asset.id] = `/api/admin/media/${asset.id}`;
        }
      }

      return jsonResponse({
        settings,
        serviceCategories,
        services,
        categories,
        portfolioItems,
        testimonials,
        latestPublish,
        mediaUrls,
        mediaAssets,
      });
    }

    // PATCH /api/admin/settings
    if (method === 'PATCH' && path === '/api/admin/settings') {
      const patch = await parseJsonBody<Record<string, unknown>>(request);
      const payload: Record<string, unknown> = { ...patch, updated_by: admin.id };
      delete payload.id;
      delete payload.draft_version;
      delete payload.updated_at;

      if (payload.site_copy && typeof payload.site_copy === 'object') {
        const { data: currentRow, error: curErr } = await service
          .from('site_settings')
          .select('site_copy')
          .eq('id', 1)
          .maybeSingle();

        if (curErr && curErr.message.includes('site_copy')) {
          throw new HttpError(
            400,
            'Kolom site_copy belum ada di database Supabase. Silakan jalankan file migrasi supabase/migrations/0006_add_site_copy.sql di SQL Editor Supabase terlebih dahulu.'
          );
        }

        const existingCopy = normalizeSiteCopy(currentRow?.site_copy);
        payload.site_copy = normalizeSiteCopy({
          ...existingCopy,
          ...(payload.site_copy as Record<string, unknown>),
        });
      }

      const { data, error } = await service
        .from('site_settings')
        .update(payload)
        .eq('id', 1)
        .select('*')
        .single();

      if (error || !data) {
        if (error?.message?.includes('site_copy')) {
          throw new HttpError(
            400,
            'Kolom site_copy belum ada di database Supabase. Silakan jalankan file migrasi supabase/migrations/0006_add_site_copy.sql di SQL Editor Supabase terlebih dahulu.'
          );
        }
        throw new HttpError(400, error?.message ?? 'Gagal menyimpan pengaturan.');
      }

      const normalizedData = {
        ...(data as SiteSettings),
        site_copy: normalizeSiteCopy((data as SiteSettings).site_copy),
      };
      return jsonResponse(normalizedData);
    }

    // POST /api/admin/media (Simpan file draft ke R2 prefix draft/)
    if (method === 'POST' && path === '/api/admin/media') {
      const bucket = requireR2Bucket(env);
      const form = await request.formData();
      const fileEntry = form.get('file');
      const folderEntry = String(form.get('folder') ?? 'general');
      const altTextEntry = String(form.get('alt_text') ?? '');

      if (!(fileEntry instanceof File)) {
        throw new HttpError(400, 'File gambar tidak ditemukan dalam unggahan.');
      }

      const validation = validateImageFile(fileEntry);
      if (!validation.ok) {
        throw new HttpError(400, validation.error);
      }

      const ext = MIME_TO_EXT[validation.mimeType] ?? 'jpg';
      const cleanFolder = folderEntry.replace(/[^a-z0-9-_]/gi, '').toLowerCase() || 'general';
      const uniqueId = crypto.randomUUID();
      const storagePath = `draft/${cleanFolder}/${Date.now()}-${uniqueId}.${ext}`;
      const arrayBuffer = await fileEntry.arrayBuffer();

      await bucket.put(storagePath, arrayBuffer, {
        httpMetadata: { contentType: validation.mimeType },
      });

      const { data: assetRow, error: dbError } = await service
        .from('media_assets')
        .insert({
          storage_bucket: 'r2',
          storage_path: storagePath,
          public_path: null,
          original_filename: fileEntry.name,
          mime_type: validation.mimeType,
          size_bytes: fileEntry.size,
          alt_text: altTextEntry.trim(),
          is_published: false,
          created_by: admin.id,
        })
        .select('*')
        .single();

      if (dbError || !assetRow) {
        await bucket.delete(storagePath);
        throw new HttpError(500, `Gagal mencatat metadata media: ${dbError?.message ?? ''}`);
      }

      const typedAsset = assetRow as MediaAsset;
      return jsonResponse(
        { asset: typedAsset, url: `/api/admin/media/${typedAsset.id}` },
        201
      );
    }

    // Service Categories CRUD
    if (method === 'POST' && path === '/api/admin/service-categories/reorder') {
      const { orderedIds } = await parseJsonBody<{ orderedIds?: string[] }>(request);
      if (!Array.isArray(orderedIds)) throw new HttpError(400, 'orderedIds tidak valid.');
      await Promise.all(
        orderedIds.map(async (id, index) => {
          const { error } = await service
            .from('service_categories')
            .update({ sort_order: index + 1 })
            .eq('id', id);
          if (error) throw new HttpError(400, error.message);
        })
      );
      return jsonResponse({ ok: true });
    }

    if (method === 'POST' && path === '/api/admin/service-categories') {
      const body = await parseJsonBody<{ name?: string; sort_order?: number }>(request);
      const name = body.name?.trim() ?? '';
      if (!name) throw new HttpError(400, 'Nama kategori layanan wajib diisi.');
      const { data, error } = await service
        .from('service_categories')
        .insert({
          name,
          slug: slugify(name),
          sort_order: body.sort_order ?? 0,
        })
        .select('*')
        .single();
      if (error || !data) {
        throw new HttpError(400, error?.message ?? 'Gagal menambah kategori layanan.');
      }
      return jsonResponse(data, 201);
    }

    const serviceCatMatch = path.match(/^\/api\/admin\/service-categories\/([^/]+)$/);
    if (serviceCatMatch) {
      const id = serviceCatMatch[1];
      if (method === 'PATCH') {
        const body = await parseJsonBody<{ name?: string; sort_order?: number }>(request);
        const name = body.name?.trim() ?? '';
        if (!name) throw new HttpError(400, 'Nama kategori layanan tidak boleh kosong.');
        const { data, error } = await service
          .from('service_categories')
          .update({
            name,
            slug: slugify(name),
            ...(typeof body.sort_order === 'number' ? { sort_order: body.sort_order } : {}),
          })
          .eq('id', id)
          .select('*')
          .single();
        if (error || !data) {
          throw new HttpError(400, error?.message ?? 'Gagal mengubah kategori layanan.');
        }
        return jsonResponse(data);
      }
      if (method === 'DELETE') {
        let targetCategoryId: string | null = null;
        try {
          const body = (await request.json()) as { targetCategoryId?: string | null };
          targetCategoryId = body.targetCategoryId ?? null;
        } catch {
          targetCategoryId = null;
        }

        if (targetCategoryId) {
          if (targetCategoryId === id) {
            throw new HttpError(400, 'Kategori pengganti harus berbeda.');
          }
          const { error: moveError } = await service
            .from('services')
            .update({ category_id: targetCategoryId })
            .eq('category_id', id);
          if (moveError) {
            throw new HttpError(400, `Gagal memindahkan layanan: ${moveError.message}`);
          }
        }

        const { error: delError } = await service
          .from('service_categories')
          .delete()
          .eq('id', id);
        if (delError) {
          throw new HttpError(400, `Gagal menghapus kategori layanan: ${delError.message}`);
        }
        return jsonResponse({ ok: true });
      }
    }

    // Services CRUD
    if (method === 'POST' && path === '/api/admin/services/reorder') {
      const { orderedIds } = await parseJsonBody<{ orderedIds?: string[] }>(request);
      if (!Array.isArray(orderedIds)) throw new HttpError(400, 'orderedIds tidak valid.');
      await Promise.all(
        orderedIds.map(async (id, index) => {
          const { error } = await service
            .from('services')
            .update({ sort_order: index + 1 })
            .eq('id', id);
          if (error) throw new HttpError(400, error.message);
        })
      );
      return jsonResponse({ ok: true });
    }

    if (method === 'POST' && path === '/api/admin/services') {
      const body = await parseJsonBody<Partial<ServiceItem>>(request);
      if (!body.name?.trim()) throw new HttpError(400, 'Nama layanan wajib diisi.');
      const { data, error } = await service
        .from('services')
        .insert({
          category_id: body.category_id || null,
          name: body.name.trim(),
          short_description: body.short_description ?? '',
          detail_description: body.detail_description ?? '',
          highlights: normalizeStringArray(body.highlights),
          price_label: body.price_label ?? '',
          media_id: body.media_id ?? null,
          fallback_demo_url: body.fallback_demo_url ?? null,
          image_alt: body.image_alt ?? '',
          image_focus_x: body.image_focus_x ?? 50,
          image_focus_y: body.image_focus_y ?? 30,
          image_zoom: body.image_zoom ?? 100,
          sort_order: body.sort_order ?? 0,
          is_visible: body.is_visible ?? true,
        })
        .select('*')
        .single();
      if (error || !data) throw new HttpError(400, error?.message ?? 'Gagal menambah layanan.');
      return jsonResponse(data, 201);
    }

    const serviceMatch = path.match(/^\/api\/admin\/services\/([^/]+)$/);
    if (serviceMatch) {
      const id = serviceMatch[1];
      if (method === 'PATCH') {
        const body = await parseJsonBody<Partial<ServiceItem>>(request);
        const { id: _i, created_at: _c, updated_at: _u, ...rest } = body;
        const payload = {
          ...rest,
          ...(rest.category_id !== undefined ? { category_id: rest.category_id || null } : {}),
          ...(rest.highlights !== undefined
            ? { highlights: normalizeStringArray(rest.highlights) }
            : {}),
        };
        const { data, error } = await service
          .from('services')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single();
        if (error || !data) throw new HttpError(400, error?.message ?? 'Gagal memperbarui layanan.');
        return jsonResponse(data);
      }
      if (method === 'DELETE') {
        const { error } = await service.from('services').delete().eq('id', id);
        if (error) throw new HttpError(400, error.message);
        return jsonResponse({ ok: true });
      }
    }

    // Categories CRUD
    if (method === 'POST' && path === '/api/admin/categories/reorder') {
      const { orderedIds } = await parseJsonBody<{ orderedIds?: string[] }>(request);
      if (!Array.isArray(orderedIds)) throw new HttpError(400, 'orderedIds tidak valid.');
      await Promise.all(
        orderedIds.map(async (id, index) => {
          const { error } = await service
            .from('portfolio_categories')
            .update({ sort_order: index + 1 })
            .eq('id', id);
          if (error) throw new HttpError(400, error.message);
        })
      );
      return jsonResponse({ ok: true });
    }

    if (method === 'POST' && path === '/api/admin/categories') {
      const body = await parseJsonBody<{ name?: string; sort_order?: number }>(request);
      const name = body.name?.trim() ?? '';
      if (!name) throw new HttpError(400, 'Nama kategori wajib diisi.');
      const { data, error } = await service
        .from('portfolio_categories')
        .insert({
          name,
          slug: slugify(name),
          sort_order: body.sort_order ?? 0,
        })
        .select('*')
        .single();
      if (error || !data) throw new HttpError(400, error?.message ?? 'Gagal menambah kategori.');
      return jsonResponse(data, 201);
    }

    const catMatch = path.match(/^\/api\/admin\/categories\/([^/]+)$/);
    if (catMatch) {
      const id = catMatch[1];
      if (method === 'PATCH') {
        const body = await parseJsonBody<{ name?: string; sort_order?: number }>(request);
        const name = body.name?.trim() ?? '';
        if (!name) throw new HttpError(400, 'Nama kategori tidak boleh kosong.');
        const { data, error } = await service
          .from('portfolio_categories')
          .update({
            name,
            slug: slugify(name),
            ...(typeof body.sort_order === 'number' ? { sort_order: body.sort_order } : {}),
          })
          .eq('id', id)
          .select('*')
          .single();
        if (error || !data) throw new HttpError(400, error?.message ?? 'Gagal mengubah kategori.');
        return jsonResponse(data);
      }
      if (method === 'DELETE') {
        let targetCategoryId: string | null = null;
        try {
          const body = (await request.json()) as { targetCategoryId?: string | null };
          targetCategoryId = body.targetCategoryId ?? null;
        } catch {
          targetCategoryId = null;
        }

        if (targetCategoryId) {
          if (targetCategoryId === id) {
            throw new HttpError(400, 'Kategori pengganti harus berbeda.');
          }
          const { error: moveError } = await service
            .from('portfolio_items')
            .update({ category_id: targetCategoryId })
            .eq('category_id', id);
          if (moveError) {
            throw new HttpError(400, `Gagal memindahkan foto: ${moveError.message}`);
          }
        }

        const { error: delError } = await service
          .from('portfolio_categories')
          .delete()
          .eq('id', id);
        if (delError) {
          throw new HttpError(400, `Gagal menghapus kategori: ${delError.message}`);
        }
        return jsonResponse({ ok: true });
      }
    }

    // Portfolio Items CRUD
    if (method === 'POST' && path === '/api/admin/portfolio/reorder') {
      const { orderedIds } = await parseJsonBody<{ orderedIds?: string[] }>(request);
      if (!Array.isArray(orderedIds)) throw new HttpError(400, 'orderedIds tidak valid.');
      await Promise.all(
        orderedIds.map(async (id, index) => {
          const { error } = await service
            .from('portfolio_items')
            .update({ sort_order: index + 1 })
            .eq('id', id);
          if (error) throw new HttpError(400, error.message);
        })
      );
      return jsonResponse({ ok: true });
    }

    if (method === 'POST' && path === '/api/admin/portfolio') {
      const body = await parseJsonBody<{
        items?: Array<Partial<PortfolioItem> & { category_id: string; title: string }>;
      }>(request);
      const items = body.items ?? [];
      if (items.length === 0) throw new HttpError(400, 'Daftar foto portofolio kosong.');
      const { data, error } = await service
        .from('portfolio_items')
        .insert(
          items.map((item) => ({
            category_id: item.category_id,
            title: item.title,
            alt_text: item.alt_text ?? '',
            media_id: item.media_id ?? null,
            fallback_demo_url: item.fallback_demo_url ?? null,
            image_focus_x: item.image_focus_x ?? 50,
            image_focus_y: item.image_focus_y ?? 35,
            image_zoom: item.image_zoom ?? 100,
            sort_order: item.sort_order ?? 0,
            is_visible: item.is_visible ?? true,
          }))
        )
        .select('*');
      if (error || !data) throw new HttpError(400, error?.message ?? 'Gagal menyimpan portofolio.');
      return jsonResponse(data, 201);
    }

    const portfolioMatch = path.match(/^\/api\/admin\/portfolio\/([^/]+)$/);
    if (portfolioMatch) {
      const id = portfolioMatch[1];
      if (method === 'PATCH') {
        const body = await parseJsonBody<Partial<PortfolioItem>>(request);
        const { id: _i, created_at: _c, updated_at: _u, ...rest } = body;
        const { data, error } = await service
          .from('portfolio_items')
          .update(rest)
          .eq('id', id)
          .select('*')
          .single();
        if (error || !data) throw new HttpError(400, error?.message ?? 'Gagal mengubah foto.');
        return jsonResponse(data);
      }
      if (method === 'DELETE') {
        const { error } = await service.from('portfolio_items').delete().eq('id', id);
        if (error) throw new HttpError(400, error.message);
        return jsonResponse({ ok: true });
      }
    }

    // Testimonials CRUD
    if (method === 'POST' && path === '/api/admin/testimonials/reorder') {
      const { orderedIds } = await parseJsonBody<{ orderedIds?: string[] }>(request);
      if (!Array.isArray(orderedIds)) throw new HttpError(400, 'orderedIds tidak valid.');
      await Promise.all(
        orderedIds.map(async (id, index) => {
          const { error } = await service
            .from('testimonials')
            .update({ sort_order: index + 1 })
            .eq('id', id);
          if (error) throw new HttpError(400, error.message);
        })
      );
      return jsonResponse({ ok: true });
    }

    if (method === 'POST' && path === '/api/admin/testimonials') {
      const body = await parseJsonBody<Partial<TestimonialItem>>(request);
      if (!body.client_name?.trim() || !body.quote?.trim()) {
        throw new HttpError(400, 'Nama pelanggan dan isi testimoni wajib diisi.');
      }
      const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating ?? 5))));
      const { data, error } = await service
        .from('testimonials')
        .insert({
          client_name: body.client_name.trim(),
          quote: body.quote.trim(),
          rating,
          media_id: null,
          image_alt: '',
          sort_order: body.sort_order ?? 0,
          is_visible: body.is_visible ?? true,
        })
        .select('*')
        .single();
      if (error || !data) throw new HttpError(400, error?.message ?? 'Gagal menambah testimoni.');
      return jsonResponse(data, 201);
    }

    const testiMatch = path.match(/^\/api\/admin\/testimonials\/([^/]+)$/);
    if (testiMatch) {
      const id = testiMatch[1];
      if (method === 'PATCH') {
        const body = await parseJsonBody<Partial<TestimonialItem>>(request);
        const { id: _i, created_at: _c, updated_at: _u, ...rest } = body;
        const payload = {
          ...rest,
          ...(rest.rating !== undefined
            ? { rating: Math.min(5, Math.max(1, Math.round(Number(rest.rating)))) }
            : {}),
        };
        const { data, error } = await service
          .from('testimonials')
          .update(payload)
          .eq('id', id)
          .select('*')
          .single();
        if (error || !data) throw new HttpError(400, error?.message ?? 'Gagal mengubah testimoni.');
        return jsonResponse(data);
      }
      if (method === 'DELETE') {
        const { error } = await service.from('testimonials').delete().eq('id', id);
        if (error) throw new HttpError(400, error.message);
        return jsonResponse({ ok: true });
      }
    }

    // POST /api/admin/publish (Promosi draft R2 -> public R2 + RPC snapshot atomik)
    if (method === 'POST' && path === '/api/admin/publish') {
      const [settingsRes, servicesRes, portfolioRes, testimonialsRes] = await Promise.all([
        service
          .from('site_settings')
          .select(
            'logo_media_id, favicon_media_id, hero_primary_media_id, hero_secondary_media_id, about_media_id, seo_og_media_id'
          )
          .eq('id', 1)
          .single(),
        service.from('services').select('media_id').eq('is_visible', true),
        service.from('portfolio_items').select('media_id').eq('is_visible', true),
        service.from('testimonials').select('media_id').eq('is_visible', true),
      ]);

      if (settingsRes.error || !settingsRes.data) {
        throw new HttpError(500, 'Gagal membaca pengaturan draft sebelum publikasi.');
      }

      const s = settingsRes.data;
      const mediaIds = Array.from(
        new Set(
          [
            s.logo_media_id,
            s.favicon_media_id,
            s.hero_primary_media_id,
            s.hero_secondary_media_id,
            s.about_media_id,
            s.seo_og_media_id,
            ...((servicesRes.data ?? []) as Array<{ media_id: string | null }>).map(
              (r) => r.media_id
            ),
            ...((portfolioRes.data ?? []) as Array<{ media_id: string | null }>).map(
              (r) => r.media_id
            ),
            ...((testimonialsRes.data ?? []) as Array<{ media_id: string | null }>).map(
              (r) => r.media_id
            ),
          ].filter((id): id is string => typeof id === 'string' && id.length > 0)
        )
      );

      if (mediaIds.length > 0) {
        const { data: assetRows, error: assetErr } = await service
          .from('media_assets')
          .select('*')
          .in('id', mediaIds);

        if (assetErr) {
          throw new HttpError(500, `Gagal memeriksa media publikasi: ${assetErr.message}`);
        }

        const unpromoted = ((assetRows ?? []) as MediaAsset[]).filter((row) => !row.public_path);
        if (unpromoted.length > 0) {
          const bucket = requireR2Bucket(env);
          for (const row of unpromoted) {
            const draftObj = await bucket.get(row.storage_path);
            if (!draftObj) {
              throw new HttpError(
                500,
                `File draft "${row.original_filename}" tidak ditemukan di R2.`
              );
            }

            const cleanRel = row.storage_path.replace(/^draft\//, '');
            const publicPath = `public/${cleanRel}`;
            await bucket.put(publicPath, await draftObj.arrayBuffer(), {
              httpMetadata: { contentType: row.mime_type },
            });

            const { error: updErr } = await service
              .from('media_assets')
              .update({ public_path: publicPath, is_published: true })
              .eq('id', row.id);
            if (updErr) {
              throw new HttpError(500, `Gagal memperbarui metadata media: ${updErr.message}`);
            }
          }
        }
      }

      const { data: releaseData, error: pubError } = await service.rpc('publish_site_snapshot', {
        p_profile_id: admin.id,
      });

      if (pubError || !releaseData) {
        throw new HttpError(500, pubError?.message ?? 'Publikasi snapshot gagal.');
      }

      return jsonResponse(releaseData);
    }

    return jsonResponse({ error: 'Endpoint admin tidak ditemukan.' }, 404);
  } catch (err) {
    if (err instanceof HttpError) {
      return jsonResponse({ error: err.message }, err.status);
    }
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan pada server.';
    return jsonResponse({ error: msg }, 500);
  }
}
