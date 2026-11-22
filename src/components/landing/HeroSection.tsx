import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowDownRight, MessageCircle, Sparkles } from 'lucide-react';
import { DEFAULT_SITE_COPY } from '../../lib/defaults';
import { registerPhotoParallax } from '../../lib/scrollChoreography';
import { buildWhatsAppUrl } from '../../lib/validation';
import type { PublishedSettings } from '../../types/cms';
import { LineRevealTitle, ScrollStage } from '../common/EditorialMotion';
import { FormattedText } from '../common/FormattedTitle';
import { SmartImage } from '../common/SmartImage';
import { HeroFloralTopLeft } from './FloralOrnaments';
import { BeautySparkleCluster, MakeupBrushBouquetOrnament } from './MakeupOrnaments';
import { CornerFlourish, PearlGarland } from './DecorOrnaments';
import { LiquidGlassAccent } from './LiquidGlassAccent';
import { SectionBackdrop } from './SectionBackdrop';

interface HeroSectionProps {
  settings: PublishedSettings;
  ready?: boolean;
}

export function HeroSection({ settings, ready = true }: HeroSectionProps) {
  const desktopParallaxRef = useRef<HTMLDivElement>(null);
  const mobileParallaxRef = useRef<HTMLDivElement>(null);
  const [contentEntered, setContentEntered] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const handleBubblePop = useCallback(() => {
    setContentEntered(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      setContentEntered(false);
    }
  }, [ready]);

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    if (desktopParallaxRef.current) {
      cleanups.push(registerPhotoParallax(desktopParallaxRef.current, 14));
    }
    if (mobileParallaxRef.current) {
      cleanups.push(registerPhotoParallax(mobileParallaxRef.current, 8));
    }
    return () => {
      for (const fn of cleanups) fn();
    };
  }, []);

  const copy = settings.site_copy ?? DEFAULT_SITE_COPY;
  const waUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    settings.hero_whatsapp_message || settings.whatsapp_default_message
  );

  return (
    <section
      id="beranda"
      className="relative overflow-hidden lg:min-h-[calc(100vh-5rem)] lg:min-h-[660px] flex flex-col justify-center landing-section-anchor"
    >
      {/* Latar Soft Blush + Champagne penuh di seluruh hero */}
      <SectionBackdrop variant="hero" pattern="lace" petals sheen edge={false} />

      {/* Gelembung kaca cair diam di tempat -> muncul & meletus -> memicu konten Hero masuk */}
      <LiquidGlassAccent
        mode="hero"
        ready={ready}
        onPop={handleBubblePop}
        className="z-30"
      />

      {/* Ornamen lembut di sisi kiri (area Soft Blush) */}
      <HeroFloralTopLeft className="pointer-events-none select-none absolute -top-2 left-2 sm:left-8 w-32 sm:w-44 opacity-35 text-[var(--color-accent)] animate-gentle-float" />
      <MakeupBrushBouquetOrnament className="pointer-events-none select-none hidden md:block absolute bottom-6 left-3 xl:left-10 w-36 lg:w-44 opacity-26 text-[var(--color-accent)] animate-float-slow" />
      <CornerFlourish className="pointer-events-none select-none hidden lg:block absolute bottom-4 left-4 w-24 opacity-35 -rotate-90 text-[var(--color-champagne)]" />

      {/* =====================================================================
          DESKTOP: Gambar Latar Setengah Kanan (Tirai Kanan -> Kiri + Fokus + Sheen)
         ===================================================================== */}
      <div
        className={`hero-half-stage hidden lg:block absolute inset-y-0 right-0 w-[58%] xl:w-[60%] overflow-hidden z-[5] ${
          contentEntered ? 'is-ready' : ''
        }`}
      >
        <div ref={desktopParallaxRef} className="w-full h-full">
          <div className="hero-half-image w-full h-full">
            <SmartImage
              src={settings.hero_primary_url}
              alt={settings.hero_primary_alt || 'Foto utama Niwayuliana Makeup Artist'}
              focusX={settings.hero_primary_focus_x}
              focusY={settings.hero_primary_focus_y}
              zoom={settings.hero_primary_zoom}
              loading="eager"
              fallbackLabel="Foto utama hero"
            />
          </div>
        </div>

        {/* Sapuan kilau cahaya halus saat tirai potret terbuka */}
        <span aria-hidden="true" className="hero-portrait-sheen" />

        {/* Gradasi leleh mulus di tepi kiri agar menyatu ke latar Soft Blush tanpa garis potong */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, var(--color-ivory) 0%, color-mix(in srgb, var(--color-blush) 62%, var(--color-ivory)) 14%, color-mix(in srgb, var(--color-blush) 28%, var(--color-ivory)) 28%, color-mix(in srgb, var(--color-ivory) 14%, transparent) 46%, transparent 66%)',
          }}
        />
        {/* Gradasi halus tepi atas & bawah */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--color-ivory) 46%, transparent) 0%, transparent 15%, transparent 84%, color-mix(in srgb, var(--color-blush) 58%, var(--color-ivory)) 100%)',
          }}
        />

        {/* Bingkai hairline tipis bergaya sampul majalah di tepi kanan potret */}
        <div
          aria-hidden="true"
          className={`hero-enter-right pointer-events-none absolute inset-y-6 right-6 left-[30%] rounded-r-[2rem] border-y border-r ${
            contentEntered ? 'is-ready' : ''
          }`}
          style={{
            borderColor: 'rgba(255, 249, 245, 0.44)',
            transitionDelay: '340ms',
          }}
        />

        {/* Kilau & mutiara lembut di sudut kanan atas potret */}
        <PearlGarland className="pointer-events-none select-none absolute top-0 right-[4%] w-72 opacity-48 text-[var(--color-ivory)]" />
        <BeautySparkleCluster className="pointer-events-none select-none absolute top-10 right-10 w-16 opacity-65 text-[var(--color-ivory)] animate-twinkle" />

        {/* Pill Editorial Halus di Sudut Kanan Bawah Potret */}
        {copy.hero_badge_text.trim() && (
          <div
            className={`hero-enter-right hidden xl:inline-flex items-center gap-2.5 absolute bottom-9 right-9 rounded-full px-4 py-2 border shadow-xs ${
              contentEntered ? 'is-ready' : ''
            }`}
            style={{
              backgroundColor: 'rgba(255, 249, 245, 0.92)',
              borderColor: 'rgba(255, 249, 245, 0.85)',
              color: 'var(--color-heading)',
              transitionDelay: '540ms',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
            <span className="text-[10px] uppercase tracking-[0.24em] font-medium">
              <FormattedText text={copy.hero_badge_text} />
            </span>
          </div>
        )}
      </div>

      {/* =====================================================================
          MOBILE & TABLET (< lg): Foto Latar Setengah Atas dengan Leleh Soft Blush Bawah
         ===================================================================== */}
      <div
        className={`hero-half-stage lg:hidden relative w-full aspect-[4/4.2] sm:aspect-[16/11] overflow-hidden z-[5] ${
          contentEntered ? 'is-ready' : ''
        }`}
      >
        <div ref={mobileParallaxRef} className="w-full h-full">
          <div className="hero-half-image w-full h-full">
            <SmartImage
              src={settings.hero_primary_url}
              alt={settings.hero_primary_alt || 'Foto utama Niwayuliana Makeup Artist'}
              focusX={settings.hero_primary_focus_x}
              focusY={settings.hero_primary_focus_y}
              zoom={settings.hero_primary_zoom}
              loading="eager"
              fallbackLabel="Foto utama hero"
            />
          </div>
        </div>
        <span aria-hidden="true" className="hero-portrait-sheen" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, transparent 42%, color-mix(in srgb, var(--color-blush) 58%, var(--color-ivory)) 86%, color-mix(in srgb, var(--color-blush) 50%, var(--color-ivory)) 100%)',
          }}
        />
      </div>

      {/* =====================================================================
          KONTEN EDITORIAL KIRI (Koreografi Masuk Kiri -> Kanan Setelah Gelembung Meletus)
         ===================================================================== */}
      <ScrollStage className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pt-8 sm:pb-20 lg:py-22 relative z-20">
        <div className="max-w-xl lg:max-w-[55%] text-center lg:text-left mx-auto lg:mx-0">
          {/* 1. Eyebrow + Garis Tipis Menggambar ke Samping */}
          <div
            className={`hero-enter-left inline-flex items-center justify-center lg:justify-start gap-3 mb-5 ${
              contentEntered ? 'is-ready' : ''
            }`}
            style={{ transitionDelay: '40ms' }}
          >
            <span
              className={`hero-line-draw hidden sm:inline-block h-px w-10 opacity-60 ${
                contentEntered ? 'is-ready' : ''
              }`}
              style={{
                backgroundColor: 'var(--color-accent)',
                transitionDelay: '90ms',
              }}
              aria-hidden="true"
            />
            <span
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.32em] font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              <Sparkles className="w-3 h-3 opacity-85" aria-hidden="true" />
              <span>
                <FormattedText text={settings.business_subtext || 'MAKEUP ARTIST'} />
              </span>
            </span>
            <span
              className={`hero-line-draw hidden sm:inline-block h-px w-10 opacity-60 ${
                contentEntered ? 'is-ready' : ''
              }`}
              style={{
                backgroundColor: 'var(--color-champagne)',
                transitionDelay: '150ms',
              }}
              aria-hidden="true"
            />
          </div>

          {/* 2. Judul Serif Editorial Besar — Reveal Per Baris + Geser Kiri ke Kanan */}
          <h1
            className="hero-title-reveal landing-serif text-[2.7rem] sm:text-5xl lg:text-[4.55rem] xl:text-[5.2rem] font-normal leading-[1.03] tracking-[-0.02em]"
            style={{
              color: 'var(--color-heading)',
              textShadow: '0 6px 30px color-mix(in srgb, var(--color-ivory) 94%, transparent)',
            }}
          >
            <LineRevealTitle text={settings.hero_title} baseDelay={120} active={contentEntered} />
          </h1>

          {/* 3. Deskripsi dengan Garis Aksen Vertikal Editorial */}
          {settings.hero_description && (
            <div
              className={`hero-enter-left relative mt-6 max-w-lg mx-auto lg:mx-0 lg:pl-5 ${
                contentEntered ? 'is-ready' : ''
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <span
                aria-hidden="true"
                className={`hero-accent-bar hidden lg:block absolute left-0 top-1 bottom-1 w-[2px] rounded-full ${
                  contentEntered ? 'is-ready' : ''
                }`}
                style={{
                  background:
                    'linear-gradient(180deg, var(--color-accent), var(--color-champagne))',
                  opacity: 0.55,
                  transitionDelay: '340ms',
                }}
              />
              <p
                className="text-base sm:text-lg leading-relaxed opacity-92"
                style={{ color: 'var(--color-body)' }}
              >
                <FormattedText text={settings.hero_description} />
              </p>
            </div>
          )}

          {/* 4. Tombol Aksi Utama — Masuk Berurutan Kiri ke Kanan */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <div
              className={`hero-enter-left ${contentEntered ? 'is-ready' : ''}`}
              style={{ transitionDelay: '420ms' }}
            >
              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-blush-pill inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm sm:text-base font-medium"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: '#FFF9F5',
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    <FormattedText text={settings.hero_cta_label || 'Konsultasi via WhatsApp'} />
                  </span>
                </a>
              ) : (
                <a
                  href="#kontak"
                  className="btn-blush-pill inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm sm:text-base font-medium"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: '#FFF9F5',
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    <FormattedText text={settings.hero_cta_label || 'Konsultasi via WhatsApp'} />
                  </span>
                </a>
              )}
            </div>

            <div
              className={`hero-enter-left ${contentEntered ? 'is-ready' : ''}`}
              style={{ transitionDelay: '510ms' }}
            >
              <a
                href="#layanan"
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm sm:text-base font-medium border transition-colors duration-300 hover:bg-[var(--color-blush)]/65"
                style={{
                  backgroundColor: 'rgba(255, 249, 245, 0.92)',
                  borderColor: 'color-mix(in srgb, var(--color-accent) 36%, transparent)',
                  color: 'var(--color-heading)',
                }}
              >
                <span>
                  <FormattedText text={copy.hero_secondary_cta_label.trim() || 'Lihat Layanan'} />
                </span>
                <ArrowDownRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* 5. Strip Bawah Kiri Editorial: Panah Gulir + Medallion Foto Detail Cincin Ganda */}
          <div
            className={`hero-enter-left mt-11 sm:mt-13 flex flex-wrap items-center justify-center lg:justify-start gap-5 ${
              contentEntered ? 'is-ready' : ''
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <a
              href="#layanan"
              aria-label="Gulir ke bagian layanan"
              className="group inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 hover:bg-[var(--color-blush)]/60"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-ivory) 85%, transparent)',
                borderColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
                color: 'var(--color-accent)',
              }}
            >
              <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>

            {settings.hero_secondary_url && (
              <div className="inline-flex items-center gap-3.5 text-left">
                <div className="relative p-1">
                  {/* Cincin luar putus-putus champagne */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full border border-dashed opacity-65"
                    style={{ borderColor: 'var(--color-champagne)' }}
                  />
                  <div
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 border shadow-xs overflow-hidden shrink-0"
                    style={{
                      backgroundColor: 'var(--color-ivory)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 32%, transparent)',
                    }}
                  >
                    <div
                      className="w-full h-full rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--color-blush)' }}
                    >
                      <SmartImage
                        src={settings.hero_secondary_url}
                        alt={settings.hero_secondary_alt || 'Detail riasan wajah natural'}
                        focusX={settings.hero_secondary_focus_x}
                        focusY={settings.hero_secondary_focus_y}
                        zoom={settings.hero_secondary_zoom}
                        loading="eager"
                        fallbackLabel="Detail riasan"
                      />
                    </div>
                  </div>
                </div>

                <div className="leading-snug">
                  <p
                    className="text-[11px] uppercase tracking-[0.24em] font-semibold"
                    style={{ color: 'var(--color-heading)' }}
                  >
                    <FormattedText text={settings.business_name} />
                  </p>
                  {copy.hero_detail_caption.trim() && (
                    <p
                      className="text-xs opacity-80 mt-0.5 flex items-center gap-1.5"
                      style={{ color: 'var(--color-body)' }}
                    >
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                        aria-hidden="true"
                      />
                      <span>
                        <FormattedText text={copy.hero_detail_caption} />
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollStage>
    </section>
  );
}
