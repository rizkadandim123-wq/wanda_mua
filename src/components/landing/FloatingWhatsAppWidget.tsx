import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send, X } from 'lucide-react';
import { DEFAULT_SITE_COPY, resolveBrandLogoUrl } from '../../lib/defaults';
import { buildWhatsAppUrl, formatWhatsAppDigits } from '../../lib/validation';
import type { PublishedSettings } from '../../types/cms';
import { FormattedText, stripTextFormatting } from '../common/FormattedTitle';

interface FloatingWhatsAppWidgetProps {
  settings: PublishedSettings;
}

function WhatsAppIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M16.01 3.2C9.04 3.2 3.38 8.85 3.38 15.82c0 2.22.58 4.39 1.69 6.3L3.2 28.8l6.85-1.8a12.56 12.56 0 0 0 5.96 1.52h.01c6.97 0 12.63-5.65 12.63-12.62 0-3.37-1.31-6.54-3.7-8.92a12.55 12.55 0 0 0-8.94-3.78Zm0 23.18h-.01a10.46 10.46 0 0 1-5.34-1.46l-.38-.23-4.06 1.07 1.08-3.96-.25-.4a10.44 10.44 0 0 1-1.6-5.58c0-5.78 4.71-10.49 10.51-10.49 2.81 0 5.44 1.09 7.42 3.08a10.42 10.42 0 0 1 3.07 7.42c0 5.79-4.71 10.55-10.44 10.55Zm5.76-7.88c-.32-.16-1.87-.92-2.16-1.03-.29-.11-.5-.16-.71.16-.21.32-.81 1.03-1 1.24-.18.21-.37.24-.68.08-.32-.16-1.33-.49-2.54-1.56-.94-.84-1.57-1.88-1.76-2.19-.18-.32-.02-.49.14-.65.14-.14.32-.37.47-.55.16-.18.21-.32.32-.53.11-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.55.08-.84.39-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.39 5.38 4.75.75.32 1.34.52 1.79.66.75.24 1.44.2 1.98.12.6-.09 1.87-.76 2.13-1.5.26-.74.26-1.37.18-1.5-.08-.13-.29-.21-.6-.37Z" />
    </svg>
  );
}

export function FloatingWhatsAppWidget({ settings }: FloatingWhatsAppWidgetProps) {
  const copy = settings.site_copy ?? DEFAULT_SITE_COPY;
  const hasPhone = Boolean(formatWhatsAppDigits(settings.whatsapp_number));
  const defaultMessage =
    settings.whatsapp_default_message.trim() ||
    settings.hero_whatsapp_message.trim() ||
    `Halo ${settings.business_name}, saya ingin berkonsultasi mengenai layanan makeup dan ketersediaan jadwal.`;

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessage((prev) => (prev.trim() ? prev : defaultMessage));
  }, [defaultMessage]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    const focusTimer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 120);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  if (!hasPhone) return null;

  const customPresets = (copy.wa_widget_presets ?? []).filter((p) => p.label.trim() && p.text.trim());
  const quickPresets = [{ label: 'Default', text: defaultMessage }, ...customPresets];

  const sendToWhatsApp = () => {
    const finalText = message.trim() || defaultMessage;
    const url = buildWhatsAppUrl(settings.whatsapp_number, finalText);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendToWhatsApp();
  };

  const handleTextareaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendToWhatsApp();
    }
  };

  const logoUrl = resolveBrandLogoUrl(settings.logo_url);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3"
    >
      {open && (
        <div
          id="floating-wa-popover"
          role="dialog"
          aria-label="Kirim pesan WhatsApp"
          className="wa-popover-in w-[calc(100vw-2.5rem)] max-w-[345px] rounded-[1.75rem] border overflow-hidden shadow-[0_24px_56px_-18px_rgba(92,42,50,0.42)]"
          style={{
            backgroundColor: 'var(--color-ivory)',
            borderColor: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
          }}
        >
          <div
            className="px-4 py-3.5 flex items-center justify-between gap-3"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#FFF9F5',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white p-1 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt={stripTextFormatting(settings.business_name)}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="landing-serif text-lg leading-tight font-medium truncate">
                  <FormattedText text={settings.business_name} />
                </p>
                <p className="text-[11px] opacity-90 flex items-center gap-1.5 mt-0.5 truncate">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFF9F5] shrink-0" />
                  <span className="truncate">
                    <FormattedText
                      text={copy.wa_widget_subtitle.trim() || DEFAULT_SITE_COPY.wa_widget_subtitle}
                    />
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer shrink-0"
              aria-label="Tutup jendela WhatsApp"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            className="p-4 space-y-3.5"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-blush) 34%, var(--color-ivory))',
            }}
          >
            {copy.wa_widget_greeting.trim() && (
              <div
                className="rounded-2xl rounded-tl-sm border px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs"
                style={{
                  backgroundColor: 'var(--color-ivory)',
                  borderColor: 'color-mix(in srgb, var(--color-accent) 16%, transparent)',
                  color: 'var(--color-body)',
                }}
              >
                <FormattedText text={copy.wa_widget_greeting} />
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  key={`${preset.label}-${idx}`}
                  type="button"
                  onClick={() => setMessage(preset.text)}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors hover:bg-[var(--color-blush)] cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-ivory)',
                    borderColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
                    color: 'var(--color-heading)',
                  }}
                >
                  <FormattedText text={preset.label} />
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <label htmlFor="floating-wa-message" className="sr-only">
                Pesan WhatsApp
              </label>
              <textarea
                id="floating-wa-message"
                ref={textareaRef}
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder={defaultMessage}
                className="w-full rounded-2xl border px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed outline-none resize-none transition-colors focus:border-[var(--color-accent)]"
                style={{
                  backgroundColor: 'var(--color-ivory)',
                  borderColor: 'color-mix(in srgb, var(--color-accent) 26%, transparent)',
                  color: 'var(--color-body)',
                }}
              />

              <button
                type="submit"
                className="btn-blush-pill w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-medium cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: '#FFF9F5',
                }}
              >
                <Send className="w-4 h-4" />
                <span>
                  <FormattedText
                    text={
                      copy.wa_widget_button_label.trim() ||
                      DEFAULT_SITE_COPY.wa_widget_button_label
                    }
                  />
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="floating-wa-popover"
        aria-label={open ? 'Tutup obrolan WhatsApp' : 'Kirim pesan WhatsApp'}
        className="group relative inline-flex items-center justify-center w-14 h-14 rounded-full shadow-[0_14px_30px_-8px_rgba(143,69,75,0.58)] transition-transform duration-250 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)] cursor-pointer"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: '#FFF9F5',
        }}
      >
        {open ? <X className="w-6 h-6" /> : <WhatsAppIcon className="w-7 h-7" />}
        {!open && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
            style={{
              backgroundColor: 'var(--color-champagne)',
              borderColor: 'var(--color-ivory)',
            }}
          />
        )}
      </button>
    </div>
  );
}
