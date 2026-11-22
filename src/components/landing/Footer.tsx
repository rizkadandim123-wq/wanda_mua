import { Instagram, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl, sanitizeExternalUrl } from '../../lib/validation';
import { resolveBrandLogoUrl } from '../../lib/defaults';
import { MakeupBrushBouquetOrnament } from './MakeupOrnaments';
import { SectionBackdrop } from './SectionBackdrop';
import { FormattedText, stripTextFormatting } from '../common/FormattedTitle';
import type { PublishedSettings, SectionKey } from '../../types/cms';

interface FooterProps {
  settings: PublishedSettings;
  hasTestimonials?: boolean;
}

const FOOTER_LINKS: Array<{ key: SectionKey; label: string; href: string }> = [
  { key: 'about', label: 'Tentang', href: '#tentang' },
  { key: 'services', label: 'Layanan', href: '#layanan' },
  { key: 'portfolio', label: 'Portofolio', href: '#portofolio' },
  { key: 'testimonials', label: 'Testimoni', href: '#testimoni' },
  { key: 'contact', label: 'Kontak', href: '#kontak' },
];

export function Footer({ settings, hasTestimonials = false }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const waUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    settings.whatsapp_default_message || settings.hero_whatsapp_message
  );

  const rawIgUrl =
    settings.instagram_url.trim() ||
    (settings.instagram_handle.trim()
      ? `https://instagram.com/${settings.instagram_handle.trim().replace(/^@/, '')}`
      : '');
  const safeIgUrl = sanitizeExternalUrl(rawIgUrl);

  const safeExtraSocials = (settings.extra_social_links ?? [])
    .map((item) => ({
      ...item,
      safeUrl: sanitizeExternalUrl(item.url),
    }))
    .filter((item): item is { id: string; label: string; url: string; safeUrl: string } =>
      Boolean(item.label.trim() && item.safeUrl)
    );

  const visibleLinks: Array<{ key: string; label: string; href: string }> = [];
  for (const item of FOOTER_LINKS) {
    if (item.key === 'contact') {
      visibleLinks.push({ key: 'partner', label: 'Daymoment', href: '#partner' });
    }
    if (item.key === 'testimonials' && !hasTestimonials) continue;
    if (settings.section_visibility[item.key] === false) continue;
    visibleLinks.push(item);
  }
  if (settings.site_copy?.feedback_visible !== false) {
    visibleLinks.push({ key: 'feedback', label: 'Masukan', href: '#masukan' });
  }

  const logoUrl = resolveBrandLogoUrl(settings.logo_url);
  const showLogo =
    settings.brand_display_mode === 'logo' || settings.brand_display_mode === 'both';
  const showText =
    settings.brand_display_mode === 'text' || settings.brand_display_mode === 'both';

  return (
    <footer
      className="relative overflow-hidden border-t py-12"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
      }}
    >
      <SectionBackdrop variant="footer" pattern="dots" edge={false} />
      <MakeupBrushBouquetOrnament className="pointer-events-none select-none hidden sm:block absolute -bottom-8 right-2 lg:right-8 w-36 sm:w-44 opacity-18 text-[var(--color-accent)]" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Deskripsi Singkat */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              {showLogo && (
                <img
                  src={logoUrl}
                  alt={stripTextFormatting(`${settings.business_name} ${settings.business_subtext}`.trim())}
                  className={`${
                    showText ? 'h-13 sm:h-14 max-w-[140px]' : 'h-16 max-w-[180px]'
                  } w-auto shrink-0 object-contain`}
                />
              )}
              {showText && (
                <div>
                  <p
                    className="landing-serif text-xl font-semibold tracking-[0.14em] uppercase"
                    style={{ color: 'var(--color-heading)' }}
                  >
                    <FormattedText text={settings.business_name} />
                  </p>
                  {settings.business_subtext && (
                    <p
                      className="text-[10px] tracking-[0.26em] uppercase opacity-80"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      <FormattedText text={settings.business_subtext} />
                    </p>
                  )}
                </div>
              )}
            </div>

            {settings.business_tagline && (
              <p
                className="mt-4 text-sm leading-relaxed max-w-sm opacity-85"
                style={{ color: 'var(--color-body)' }}
              >
                <FormattedText text={settings.business_tagline} />
              </p>
            )}
          </div>

          {/* Navigasi Ringkas */}
          <div className="md:col-span-4">
            <p
              className="text-xs uppercase tracking-[0.2em] font-medium mb-3"
              style={{ color: 'var(--color-heading)' }}
            >
              Navigasi
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <li>
                <a
                  href="#beranda"
                  className="editorial-link py-0.5"
                  style={{ color: 'var(--color-body)' }}
                >
                  Beranda
                </a>
              </li>
              {visibleLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="editorial-link py-0.5"
                    style={{ color: 'var(--color-body)' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Media Sosial yang Sudah Diisi */}
          <div className="md:col-span-3">
            {(waUrl || safeIgUrl || safeExtraSocials.length > 0) && (
              <>
                <p
                  className="text-xs uppercase tracking-[0.2em] font-medium mb-3"
                  style={{ color: 'var(--color-heading)' }}
                >
                  Terhubung
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium hover:bg-[var(--color-ivory)]/60 transition-colors"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
                        color: 'var(--color-heading)',
                      }}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {safeIgUrl && (
                    <a
                      href={safeIgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium hover:bg-[var(--color-ivory)]/60 transition-colors"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
                        color: 'var(--color-heading)',
                      }}
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>{settings.instagram_handle.trim() || 'Instagram'}</span>
                    </a>
                  )}
                  {safeExtraSocials.map((item) => (
                    <a
                      key={item.id}
                      href={item.safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium hover:bg-[var(--color-ivory)]/60 transition-colors"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
                        color: 'var(--color-heading)',
                      }}
                    >
                      <FormattedText text={item.label} />
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-75"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-accent) 16%, transparent)',
            color: 'var(--color-body)',
          }}
        >
          <p>
            &copy; {currentYear}{' '}
            <a
              href="https://daysheet.id"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
            >
              daysheet.id
            </a>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
