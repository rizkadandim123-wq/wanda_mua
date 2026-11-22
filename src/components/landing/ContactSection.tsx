import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Clock,
  ExternalLink,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_SITE_COPY } from '../../lib/defaults';
import { buildWhatsAppUrl, sanitizeExternalUrl } from '../../lib/validation';
import type { PublishedSettings } from '../../types/cms';
import { LineRevealTitle, ScrollStage } from '../common/EditorialMotion';
import { FormattedText } from '../common/FormattedTitle';
import { BotanicalCrest } from './FloralOrnaments';
import {
  BeautySparkleCluster,
  MakeupLipstickOrnament,
  PerfumeBottleOrnament,
} from './MakeupOrnaments';
import { PearlGarland } from './DecorOrnaments';
import { SectionBackdrop } from './SectionBackdrop';

interface ContactSectionProps {
  settings: PublishedSettings;
}

export function ContactSection({ settings }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(
    () =>
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntered(true);
      return;
    }

    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setEntered(true);
          } else {
            const rect = entry.boundingClientRect;
            const vh = window.innerHeight || 800;
            if (rect.top > vh + 130 || rect.bottom < -130) {
              setEntered(false);
            }
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const copy = settings.site_copy ?? DEFAULT_SITE_COPY;

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

  const hasEmail = Boolean(settings.email.trim());
  const hasAddress = Boolean(settings.address_or_area.trim());
  const hasHours = Boolean(settings.operating_hours.trim());
  const hasInstagram = Boolean(safeIgUrl || settings.instagram_handle.trim());

  const hasConciergeRows = Boolean(hasInstagram || hasEmail || hasAddress || hasHours);
  const hasAnyContact = Boolean(waUrl || hasConciergeRows || safeExtraSocials.length > 0);

  // Bangun daftar baris concierge rapi untuk animasi beruntun yang konsisten
  let rowOrder = 0;
  const nextRowDelay = () => {
    const delay = 220 + rowOrder * 85;
    rowOrder += 1;
    return delay;
  };

  return (
    <section
      id="kontak"
      ref={sectionRef}
      className="relative overflow-hidden py-20 sm:py-26 lg:py-30 landing-section-anchor"
    >
      <SectionBackdrop variant="hero" pattern="lace" petals sheen />

      {/* Aura Halo Lembut Mekar di Tengah Latar Saat Section Masuk */}
      <div
        aria-hidden="true"
        className={`contact-halo-bloom pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] sm:w-[760px] sm:h-[620px] rounded-full ${
          entered ? 'is-ready' : ''
        }`}
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--color-champagne) 24%, rgba(255, 249, 245, 0.72)) 0%, color-mix(in srgb, var(--color-blush) 38%, transparent) 46%, transparent 72%)',
        }}
      />

      <PearlGarland className="pointer-events-none select-none hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-80 lg:w-96 opacity-50 text-[var(--color-champagne)]" />
      <MakeupLipstickOrnament className="pointer-events-none select-none hidden xl:block absolute top-1/2 -translate-y-1/2 left-4 w-32 opacity-26 text-[var(--color-accent)] animate-float-slow" />
      <PerfumeBottleOrnament className="pointer-events-none select-none hidden xl:block absolute top-1/2 -translate-y-1/2 right-4 w-32 opacity-26 text-[var(--color-accent)] animate-float-delayed" />

      <ScrollStage className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* =================================================================
              KIRI: Undangan Reservasi Editorial yang Terbuka, Hangat, & Luwes
             ================================================================= */}
          <div className="lg:col-span-6 text-center lg:text-left">
            <div
              className={`contact-editorial-in ${entered ? 'is-ready' : ''}`}
              style={{ transitionDelay: '20ms' }}
            >
              <BotanicalCrest className="w-36 h-9 mx-auto lg:mx-0 mb-4 text-[var(--color-accent)] opacity-85" />
              <div className="inline-flex items-center justify-center lg:justify-start gap-3 mb-2">
                <span
                  className={`hero-line-draw inline-block h-px w-8 opacity-55 ${
                    entered ? 'is-ready' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    transitionDelay: '70ms',
                  }}
                  aria-hidden="true"
                />
                <span
                  className="text-[11px] uppercase tracking-[0.28em] font-medium"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <FormattedText text={copy.contact_eyebrow.trim() || 'Reservation & Inquiry'} />
                </span>
              </div>
            </div>

            <h2
              className="landing-serif text-4xl sm:text-5xl lg:text-[3.35rem] font-normal leading-[1.08] tracking-[-0.015em]"
              style={{ color: 'var(--color-heading)' }}
            >
              <LineRevealTitle text={settings.contact_title} baseDelay={80} active={entered} />
            </h2>

            {settings.contact_description && (
              <div
                className={`contact-editorial-in relative mt-6 max-w-lg mx-auto lg:mx-0 lg:pl-5 ${
                  entered ? 'is-ready' : ''
                }`}
                style={{ transitionDelay: '180ms' }}
              >
                <span
                  aria-hidden="true"
                  className={`about-story-line hidden lg:block absolute left-0 top-1 bottom-1 w-[2px] rounded-full ${
                    entered ? 'is-ready' : ''
                  }`}
                  style={{
                    background:
                      'linear-gradient(180deg, var(--color-accent), var(--color-champagne))',
                    opacity: 0.48,
                    transitionDelay: '210ms',
                  }}
                />
                <p
                  className="text-sm sm:text-base leading-relaxed opacity-90"
                  style={{ color: 'var(--color-body)' }}
                >
                  <FormattedText text={settings.contact_description} />
                </p>
              </div>
            )}

            {/* Aksi Utama: Tombol Konsultasi WhatsApp */}
            {waUrl && (
              <div
                className={`contact-editorial-in mt-8 sm:mt-9 flex flex-wrap items-center justify-center lg:justify-start gap-3.5 ${
                  entered ? 'is-ready' : ''
                }`}
                style={{ transitionDelay: '270ms' }}
              >
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-blush-pill group inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm sm:text-base font-medium"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: '#FFF9F5',
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    <FormattedText text={copy.contact_cta_label.trim() || 'Konsultasi via WhatsApp'} />
                  </span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            )}

            {copy.contact_note.trim() && (
              <div
                className={`contact-editorial-in mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] opacity-70 ${
                  entered ? 'is-ready' : ''
                }`}
                style={{
                  color: 'var(--color-heading)',
                  transitionDelay: '350ms',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-champagne)' }} />
                <span>
                  <FormattedText text={settings.business_name} /> ·{' '}
                  <FormattedText text={copy.contact_note} />
                </span>
              </div>
            )}
          </div>

          {/* =================================================================
              KANAN: Folio Concierge Atelier (Membuka Mulus Seperti Buku Janji Temu)
             ================================================================= */}
          <div className="lg:col-span-6">
            <div
              className={`contact-folio-unfold relative rounded-[2.25rem] border p-7 sm:p-9 lg:p-10 shadow-[0_26px_60px_-34px_rgba(143,69,75,0.28)] ${
                entered ? 'is-ready' : ''
              }`}
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-ivory) 94%, transparent)',
                borderColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
                transitionDelay: '120ms',
              }}
            >
              {/* Garis bingkai dalam halus bergaya kartu butik kecantikan */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-3 rounded-[1.65rem] border"
                style={{
                  borderColor: 'color-mix(in srgb, var(--color-champagne) 32%, transparent)',
                }}
              />

              <BeautySparkleCluster className="pointer-events-none select-none absolute top-5 right-5 w-12 opacity-35 text-[var(--color-accent)] animate-twinkle" />

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 pb-5 border-b border-[var(--color-accent)]/14">
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-[0.26em] font-semibold"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      <FormattedText text={copy.contact_card_eyebrow.trim() || 'Atelier Concierge'} />
                    </p>
                    <h3
                      className="landing-serif text-2xl sm:text-[1.75rem] font-normal mt-0.5"
                      style={{ color: 'var(--color-heading)' }}
                    >
                      <FormattedText text={copy.contact_card_title.trim() || 'Informasi & Jadwal Layanan'} />
                    </h3>
                  </div>
                </div>

                {hasAnyContact ? (
                  <div className="mt-2 divide-y divide-[var(--color-accent)]/12">
                    {hasInstagram && (() => {
                      const delay = nextRowDelay();
                      const content = (
                        <div className="py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <span
                              className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full border transition-colors duration-250 group-hover:bg-[var(--color-accent)] group-hover:text-[#FFF9F5]"
                              style={{
                                backgroundColor: 'var(--color-blush)',
                                borderColor:
                                  'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                                color: 'var(--color-accent)',
                              }}
                            >
                              <Instagram className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <p
                                className="text-[10px] uppercase tracking-[0.2em] opacity-65"
                                style={{ color: 'var(--color-body)' }}
                              >
                                Instagram
                              </p>
                              <p
                                className="mt-0.5 text-sm sm:text-[15px] font-medium truncate"
                                style={{ color: 'var(--color-heading)' }}
                              >
                                {settings.instagram_handle.trim() || safeIgUrl}
                              </p>
                            </div>
                          </div>
                          {safeIgUrl && (
                            <ArrowUpRight
                              className="w-4 h-4 shrink-0 opacity-60 transition-transform duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                              style={{ color: 'var(--color-accent)' }}
                            />
                          )}
                        </div>
                      );

                      return (
                        <div
                          className={`contact-row-glide ${entered ? 'is-ready' : ''}`}
                          style={{ transitionDelay: `${delay}ms` }}
                        >
                          {safeIgUrl ? (
                            <a
                              href={safeIgUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block rounded-2xl px-2 -mx-2 transition-colors duration-200 hover:bg-[var(--color-blush)]/40"
                            >
                              {content}
                            </a>
                          ) : (
                            <div className="group">{content}</div>
                          )}
                        </div>
                      );
                    })()}

                    {hasEmail && (() => {
                      const delay = nextRowDelay();
                      return (
                        <div
                          className={`contact-row-glide ${entered ? 'is-ready' : ''}`}
                          style={{ transitionDelay: `${delay}ms` }}
                        >
                          <a
                            href={`mailto:${settings.email.trim()}`}
                            className="group block rounded-2xl px-2 -mx-2 transition-colors duration-200 hover:bg-[var(--color-blush)]/40"
                          >
                            <div className="py-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 min-w-0">
                                <span
                                  className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full border transition-colors duration-250 group-hover:bg-[var(--color-accent)] group-hover:text-[#FFF9F5]"
                                  style={{
                                    backgroundColor: 'var(--color-blush)',
                                    borderColor:
                                      'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                                    color: 'var(--color-accent)',
                                  }}
                                >
                                  <Mail className="w-4 h-4" />
                                </span>
                                <div className="min-w-0">
                                  <p
                                    className="text-[10px] uppercase tracking-[0.2em] opacity-65"
                                    style={{ color: 'var(--color-body)' }}
                                  >
                                    Email
                                  </p>
                                  <p
                                    className="mt-0.5 text-sm sm:text-[15px] font-medium truncate"
                                    style={{ color: 'var(--color-heading)' }}
                                  >
                                    {settings.email.trim()}
                                  </p>
                                </div>
                              </div>
                              <ArrowUpRight
                                className="w-4 h-4 shrink-0 opacity-60 transition-transform duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                                style={{ color: 'var(--color-accent)' }}
                              />
                            </div>
                          </a>
                        </div>
                      );
                    })()}

                    {hasAddress && (() => {
                      const delay = nextRowDelay();
                      return (
                        <div
                          className={`contact-row-glide py-4 flex items-start gap-4 ${
                            entered ? 'is-ready' : ''
                          }`}
                          style={{ transitionDelay: `${delay}ms` }}
                        >
                          <span
                            className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full border"
                            style={{
                              backgroundColor: 'var(--color-blush)',
                              borderColor:
                                'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                              color: 'var(--color-accent)',
                            }}
                          >
                            <MapPin className="w-4 h-4" />
                          </span>
                          <div className="min-w-0 pt-0.5">
                            <p
                              className="text-[10px] uppercase tracking-[0.2em] opacity-65"
                              style={{ color: 'var(--color-body)' }}
                            >
                              Lokasi &amp; Area Layanan
                            </p>
                            <p
                              className="mt-0.5 text-sm sm:text-[15px] font-medium leading-snug"
                              style={{ color: 'var(--color-heading)' }}
                            >
                              <FormattedText text={settings.address_or_area.trim()} />
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {hasHours && (() => {
                      const delay = nextRowDelay();
                      return (
                        <div
                          className={`contact-row-glide py-4 flex items-start gap-4 ${
                            entered ? 'is-ready' : ''
                          }`}
                          style={{ transitionDelay: `${delay}ms` }}
                        >
                          <span
                            className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full border"
                            style={{
                              backgroundColor: 'var(--color-blush)',
                              borderColor:
                                'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                              color: 'var(--color-accent)',
                            }}
                          >
                            <Clock className="w-4 h-4" />
                          </span>
                          <div className="min-w-0 pt-0.5">
                            <p
                              className="text-[10px] uppercase tracking-[0.2em] opacity-65"
                              style={{ color: 'var(--color-body)' }}
                            >
                              Jam Operasional
                            </p>
                            <p
                              className="mt-0.5 text-sm sm:text-[15px] font-medium leading-snug"
                              style={{ color: 'var(--color-heading)' }}
                            >
                              <FormattedText text={settings.operating_hours.trim()} />
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {safeExtraSocials.length > 0 && (() => {
                      const delay = nextRowDelay();
                      return (
                        <div
                          className={`contact-row-glide pt-5 ${entered ? 'is-ready' : ''}`}
                          style={{ transitionDelay: `${delay}ms` }}
                        >
                          <p
                            className="text-[10px] uppercase tracking-[0.22em] opacity-65 mb-2.5"
                            style={{ color: 'var(--color-body)' }}
                          >
                            Tautan Lainnya
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {safeExtraSocials.map((social) => (
                              <a
                                key={social.id}
                                href={social.safeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium border transition-colors hover:bg-[var(--color-blush)]/65"
                                style={{
                                  backgroundColor:
                                    'color-mix(in srgb, var(--color-blush) 32%, var(--color-ivory))',
                                  borderColor:
                                    'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                                  color: 'var(--color-heading)',
                                }}
                              >
                                <span>
                                  <FormattedText text={social.label} />
                                </span>
                                <ExternalLink
                                  className="w-3.5 h-3.5"
                                  style={{ color: 'var(--color-accent)' }}
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p
                    className="mt-6 text-sm opacity-75 italic"
                    style={{ color: 'var(--color-body)' }}
                  >
                    Informasi kontak resmi sedang disiapkan dan akan segera ditampilkan.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollStage>
    </section>
  );
}
