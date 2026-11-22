import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Gift, Images, MessageSquareHeart, Music, X } from 'lucide-react';
import { formatIdrCurrency } from '../../lib/pagination';
import type { DaymomentTemplate } from '../../types/partner';

interface PartnerTemplateModalProps {
  template: DaymomentTemplate | null;
  onClose: () => void;
}

export function PartnerTemplateModal({ template, onClose }: PartnerTemplateModalProps) {
  useEffect(() => {
    if (!template) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [template, onClose]);

  if (!template || typeof document === 'undefined') return null;

  const coverUrl = template.full_thumbnail_url || template.full_phone_cover_url;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3a2529]/58 overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl"
        style={{
          backgroundColor: 'var(--color-ivory)',
          borderColor: 'color-mix(in srgb, var(--color-accent) 25%, transparent)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full border shadow-sm hover:opacity-85 transition-opacity"
          style={{
            backgroundColor: 'var(--color-ivory)',
            borderColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
            color: 'var(--color-heading)',
          }}
          aria-label="Tutup detail template"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Preview Sampul */}
        {coverUrl && (
          <div
            className="aspect-[16/9] w-full overflow-hidden rounded-t-3xl"
            style={{ backgroundColor: 'var(--color-blush)' }}
          >
            <img
              src={coverUrl}
              alt={`Preview template ${template.name}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border"
                style={{
                  backgroundColor: 'var(--color-blush)',
                  borderColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
                  color: 'var(--color-heading)',
                }}
              >
                {template.category}
              </span>
              <span
                className="text-xs uppercase tracking-[0.18em] font-medium opacity-75"
                style={{ color: 'var(--color-accent)' }}
              >
                Daymoment Partner
              </span>
            </div>

            <h3
              id="partner-modal-title"
              className="landing-serif text-3xl sm:text-4xl font-normal leading-tight"
              style={{ color: 'var(--color-heading)' }}
            >
              {template.name}
            </h3>

            {template.description && (
              <p
                className="text-sm sm:text-base leading-relaxed opacity-90"
                style={{ color: 'var(--color-body)' }}
              >
                {template.description}
              </p>
            )}
          </div>

          {/* Daftar Paket Template */}
          {template.packages.length > 0 && (
            <div className="space-y-3">
              <p
                className="text-xs uppercase tracking-[0.2em] font-semibold"
                style={{ color: 'var(--color-accent)' }}
              >
                Pilihan Paket Undangan ({template.packages.length})
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {template.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="rounded-2xl border p-4 flex flex-col justify-between gap-3"
                    style={{
                      backgroundColor:
                        'color-mix(in srgb, var(--color-blush) 34%, var(--color-ivory))',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                    }}
                  >
                    <div className="space-y-1.5">
                      <p
                        className="text-xs uppercase tracking-[0.18em] font-semibold"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        {pkg.name}
                      </p>
                      <p
                        className="landing-serif text-2xl font-medium"
                        style={{ color: 'var(--color-heading)' }}
                      >
                        {formatIdrCurrency(pkg.price)}
                      </p>
                      {pkg.tagline && (
                        <p
                          className="text-xs leading-relaxed opacity-85"
                          style={{ color: 'var(--color-body)' }}
                        >
                          {pkg.tagline}
                        </p>
                      )}
                    </div>

                    <div
                      className="pt-2.5 border-t flex flex-wrap gap-1.5 text-[11px]"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--color-accent) 16%, transparent)',
                        color: 'var(--color-body)',
                      }}
                    >
                      {pkg.gallery_limit > 0 && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 border"
                          style={{
                            backgroundColor: 'var(--color-ivory)',
                            borderColor: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
                          }}
                        >
                          <Images className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                          <span>{pkg.gallery_limit} Foto</span>
                        </span>
                      )}
                      {pkg.has_music && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 border"
                          style={{
                            backgroundColor: 'var(--color-ivory)',
                            borderColor: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
                          }}
                        >
                          <Music className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                          <span>Musik</span>
                        </span>
                      )}
                      {pkg.has_wishes && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 border"
                          style={{
                            backgroundColor: 'var(--color-ivory)',
                            borderColor: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
                          }}
                        >
                          <MessageSquareHeart
                            className="w-3 h-3"
                            style={{ color: 'var(--color-accent)' }}
                          />
                          <span>RSVP</span>
                        </span>
                      )}
                      {pkg.has_gift && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 border"
                          style={{
                            backgroundColor: 'var(--color-ivory)',
                            borderColor: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
                          }}
                        >
                          <Gift className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                          <span>Amplop</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tombol Aksi */}
          <div
            className="pt-4 border-t flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3"
            style={{ borderColor: 'color-mix(in srgb, var(--color-accent) 18%, transparent)' }}
          >
            <a
              href={template.preview_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-[var(--color-blush)]/55 transition-colors"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-accent) 36%, transparent)',
                color: 'var(--color-heading)',
              }}
            >
              <span>Lihat Preview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={template.order_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-blush-pill inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#FFF9F5',
              }}
            >
              <span>Pilih Template</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('landing-modal-root') ?? document.body
  );
}
