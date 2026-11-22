import type {
  DaymomentPackage,
  DaymomentPartnerResponse,
  DaymomentTemplate,
} from '../types/partner';

export const DAYMOMENT_WEBSITE_URL = 'https://daymoment.id';
export const DAYMOMENT_REFERRAL_CODE = 'WANDHANIWAYULIANA';
export const DAYMOMENT_REFERRAL_URL = `${DAYMOMENT_WEBSITE_URL}/ref/${DAYMOMENT_REFERRAL_CODE}`;

export function buildDaymomentPreviewUrl(slug: string): string {
  return `${DAYMOMENT_WEBSITE_URL}/template/${encodeURIComponent(slug)}?ref=${DAYMOMENT_REFERRAL_CODE}`;
}

export function buildDaymomentOrderUrl(slug: string): string {
  return `${DAYMOMENT_REFERRAL_URL}?template=${encodeURIComponent(slug)}`;
}

export function slugifyDaymomentTemplate(value: string): string {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function resolveDaymomentAssetUrl(rawPath: unknown): string | null {
  if (typeof rawPath !== 'string') return null;
  const trimmed = rawPath.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) {
    return `${DAYMOMENT_WEBSITE_URL}${trimmed}`;
  }
  return `${DAYMOMENT_WEBSITE_URL}/${trimmed}`;
}

export function normalizeDaymomentTemplates(rawTemplates: unknown): DaymomentTemplate[] {
  if (!Array.isArray(rawTemplates)) return [];

  const result: DaymomentTemplate[] = [];

  for (const item of rawTemplates) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    if (rec.is_active === false) continue;

    const rawPackages = Array.isArray(rec.packages) ? rec.packages : [];
    const packages: DaymomentPackage[] = rawPackages
      .filter((pkg): pkg is Record<string, unknown> => Boolean(pkg && typeof pkg === 'object'))
      .filter((pkg) => pkg.is_active !== false)
      .map((pkg) => ({
        id: Number(pkg.id ?? 0),
        template_id: Number(pkg.template_id ?? rec.id ?? 0),
        code: String(pkg.code ?? ''),
        name: String(pkg.name ?? ''),
        price: Number(pkg.price ?? 0),
        tagline: String(pkg.tagline ?? ''),
        gallery_limit: Number(pkg.gallery_limit ?? 0),
        has_music: Boolean(pkg.has_music),
        has_wishes: Boolean(pkg.has_wishes),
        has_gift: Boolean(pkg.has_gift),
        sort_order: Number(pkg.sort_order ?? 0),
      }))
      .sort((a, b) => a.sort_order - b.sort_order);

    const name = String(rec.name ?? '');
    const code = String(rec.code ?? '');
    const rawSlug = String(rec.url_slug ?? '');
    const slug = slugifyDaymomentTemplate(rawSlug || name || code);

    const rawStartingPrice = rec.starting_price;
    let startingPrice: number | null =
      typeof rawStartingPrice === 'number' && Number.isFinite(rawStartingPrice)
        ? rawStartingPrice
        : null;
    if (startingPrice === null && packages.length > 0) {
      startingPrice = packages.reduce(
        (min, pkg) => (pkg.price > 0 && pkg.price < min ? pkg.price : min),
        packages[0].price
      );
    }

    const slugKey = slug || code || String(rec.id ?? '');

    result.push({
      id: Number(rec.id ?? 0),
      code,
      url_slug: rawSlug || slug,
      name,
      category: String(rec.category ?? 'Template'),
      description: String(rec.description ?? ''),
      full_thumbnail_url: resolveDaymomentAssetUrl(rec.thumbnail_url),
      full_phone_cover_url: resolveDaymomentAssetUrl(rec.phone_cover_url),
      starting_price: startingPrice,
      package_count: Number(rec.package_count ?? packages.length),
      packages,
      preview_url: buildDaymomentPreviewUrl(slugKey),
      order_url: buildDaymomentOrderUrl(slugKey),
    });
  }

  return result;
}

export async function fetchDaymomentTemplates(): Promise<DaymomentTemplate[]> {
  const res = await fetch('/api/public/partner/daymoment', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (res.status === 404) {
    // Fallback jika dev server Vite lokal belum di-restart setelah penambahan proxy API
    const directRes = await fetch(`${DAYMOMENT_WEBSITE_URL}/api/templates`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!directRes.ok) {
      throw new Error(`Katalog template Daymoment gagal dimuat (HTTP ${directRes.status}).`);
    }
    const directData = (await directRes.json()) as { templates?: unknown };
    return normalizeDaymomentTemplates(directData.templates);
  }

  const data = (await res.json().catch(() => null)) as DaymomentPartnerResponse | null;
  if (!res.ok || !data || data.ok === false) {
    throw new Error(
      data?.error || `Katalog template Daymoment gagal dimuat (HTTP ${res.status}).`
    );
  }

  const templates = Array.isArray(data.templates) ? data.templates : [];
  return templates.map((tpl) => {
    const slugKey = slugifyDaymomentTemplate(tpl.url_slug || tpl.name || tpl.code) || tpl.code || String(tpl.id);
    return {
      ...tpl,
      preview_url: buildDaymomentPreviewUrl(slugKey),
      order_url: buildDaymomentOrderUrl(slugKey),
    };
  });
}
