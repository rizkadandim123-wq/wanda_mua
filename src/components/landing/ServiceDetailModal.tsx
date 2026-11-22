import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, MessageCircle, Sparkles, X } from 'lucide-react';
import { buildWhatsAppUrl } from '../../lib/validation';
import type { PublishedService } from '../../types/cms';
import { FormattedText, stripTextFormatting } from '../common/FormattedTitle';
import { SmartImage } from '../common/SmartImage';

interface ServiceDetailModalProps {
  service: PublishedService | null;
  categoryName?: string | null;
  whatsappNumber: string;
  onClose: () => void;
}

export function ServiceDetailModal({
  service,
  categoryName,
  whatsappNumber,
  onClose,
}: ServiceDetailModalProps) {
  useEffect(() => {
    if (!service) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, service]);

  if (!service || typeof document === 'undefined') return null;

  const waUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Halo Niwayuliana Makeup Artist, saya ingin berkonsultasi mengenai layanan ${stripTextFormatting(service.name)}.`
  );

  const paragraphs = (service.detail_description || service.short_description)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return createPortal(
    <div
      className="service-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#3d282c]/48 overscroll-contain"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
    >
      <div
        className="service-modal-panel relative w-full max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-[2rem] border shadow-[0_28px_70px_-24px_rgba(61,40,44,0.45)] grid grid-cols-1 sm:grid-cols-12"
        style={{
          backgroundColor: 'var(--color-ivory)',
          borderColor: 'color-mix(in srgb, var(--color-accent) 26%, transparent)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full border transition-colors hover:bg-[var(--color-blush)] cursor-pointer"
          style={{
            backgroundColor: 'rgba(255, 249, 245, 0.94)',
            borderColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
            color: 'var(--color-heading)',
          }}
          aria-label="Tutup detail layanan"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Foto Editorial Kiri */}
        <div className="relative sm:col-span-5 aspect-[4/5] sm:aspect-auto sm:min-h-[420px] bg-[var(--color-blush)] overflow-hidden">
          <SmartImage
            src={service.image_url}
            alt={service.image_alt || service.name}
            focusX={service.image_focus_x}
            focusY={service.image_focus_y}
            zoom={service.image_zoom}
            loading="eager"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-3 rounded-[1.25rem] border"
            style={{ borderColor: 'rgba(255, 249, 245, 0.45)' }}
          />
          {categoryName && (
            <span
              className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.22em] font-semibold border"
              style={{
                backgroundColor: 'rgba(255, 249, 245, 0.92)',
                borderColor: 'rgba(255, 249, 245, 0.96)',
                color: 'var(--color-heading)',
              }}
            >
              <Sparkles className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
              <span>
                <FormattedText text={categoryName} />
              </span>
            </span>
          )}
        </div>

        {/* Rincian Layanan Kanan */}
        <div className="sm:col-span-7 p-6 sm:p-8 lg:p-9 flex flex-col justify-between gap-6">
          <div>
            <span
              className="text-[11px] uppercase tracking-[0.26em] font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              {categoryName ? (
                <>
                  Layanan · <FormattedText text={categoryName} />
                </>
              ) : (
                'Detail Layanan'
              )}
            </span>
            <h3
              id="service-modal-title"
              className="landing-serif text-3xl sm:text-[2.15rem] font-normal leading-tight mt-1.5"
              style={{ color: 'var(--color-heading)' }}
            >
              <FormattedText text={service.name} />
            </h3>

            {service.price_label.trim() && (
              <p
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium border"
                style={{
                  backgroundColor: 'var(--color-blush)',
                  borderColor: 'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                  color: 'var(--color-heading)',
                }}
              >
                <FormattedText text={service.price_label} />
              </p>
            )}

            {paragraphs.length > 0 && (
              <div className="mt-5 space-y-3 text-sm sm:text-[15px] leading-relaxed">
                {paragraphs.map((p, idx) => (
                  <p key={idx} style={{ color: 'var(--color-body)' }}>
                    <FormattedText text={p} />
                  </p>
                ))}
              </div>
            )}

            {service.highlights.length > 0 && (
              <div
                className="mt-6 rounded-2xl border p-4 sm:p-5 space-y-3"
                style={{
                  backgroundColor:
                    'color-mix(in srgb, var(--color-blush) 34%, var(--color-ivory))',
                  borderColor: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
                }}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.2em] font-semibold"
                  style={{ color: 'var(--color-heading)' }}
                >
                  Yang Termasuk Dalam Layanan
                </p>
                <ul className="space-y-2">
                  {service.highlights.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm leading-snug"
                      style={{ color: 'var(--color-body)' }}
                    >
                      <Check
                        className="w-4 h-4 shrink-0 mt-0.5"
                        style={{ color: 'var(--color-accent)' }}
                        aria-hidden="true"
                      />
                      <span>
                        <FormattedText text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            className="pt-4 border-t flex flex-wrap items-center gap-3"
            style={{ borderColor: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' }}
          >
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-blush-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: '#FFF9F5',
                }}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasi Layanan Ini</span>
              </a>
            ) : (
              <a
                href="#kontak"
                onClick={onClose}
                className="btn-blush-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: '#FFF9F5',
                }}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hubungi Kami</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-3 text-sm font-medium border transition-colors hover:bg-[var(--color-blush)]/55 cursor-pointer"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-accent) 26%, transparent)',
                color: 'var(--color-heading)',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('landing-modal-root') ?? document.body
  );
}
