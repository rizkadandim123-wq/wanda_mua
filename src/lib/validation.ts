export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_TYPES)[number];

export function validateImageFile(
  file: File
): { ok: true; mimeType: AllowedImageMimeType } | { ok: false; error: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageMimeType)) {
    return {
      ok: false,
      error: `Format file "${file.name}" tidak didukung. Gunakan gambar JPG, PNG, atau WebP.`,
    };
  }
  if (file.size <= 0) {
    return {
      ok: false,
      error: `File "${file.name}" tampak kosong atau rusak.`,
    };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      ok: false,
      error: `Ukuran "${file.name}" (${mb} MB) melebihi batas maksimal 5 MB.`,
    };
  }
  return { ok: true, mimeType: file.type as AllowedImageMimeType };
}

export function sanitizeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidate =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : trimmed.includes('.') && !trimmed.includes(':') && !trimmed.includes(' ')
        ? `https://${trimmed}`
        : trimmed;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isValidHexColor(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex.trim());
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Mengubah input nomor telepon Indonesia atau internasional menjadi digit E.164 tanpa tanda '+'.
 * Mengembalikan null bila kosong atau tidak valid.
 */
export function formatWhatsAppDigits(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;

  let normalized = digits;
  if (normalized.startsWith('00')) {
    normalized = normalized.slice(2);
  } else if (normalized.startsWith('0')) {
    normalized = `62${normalized.slice(1)}`;
  }

  if (normalized.length < 9 || normalized.length > 15) {
    return null;
  }
  return normalized;
}

export function buildWhatsAppUrl(
  rawNumber: string | null | undefined,
  message?: string | null
): string | null {
  const digits = formatWhatsAppDigits(rawNumber);
  if (!digits) return null;

  const text = message?.trim();
  if (!text) {
    return `https://wa.me/${digits}`;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || `kategori-${Date.now()}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const transform = (channel: number) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(rgb.r) + 0.7152 * transform(rgb.g) + 0.0722 * transform(rgb.b);
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
