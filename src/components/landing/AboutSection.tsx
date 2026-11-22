import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { registerPhotoParallax } from '../../lib/scrollChoreography';
import type { PublishedSettings } from '../../types/cms';
import { LineRevealTitle, ScrollStage } from '../common/EditorialMotion';
import { FormattedText } from '../common/FormattedTitle';
import { SmartImage } from '../common/SmartImage';
import { HeroFloralBottomRight } from './FloralOrnaments';
import { BeautySparkleCluster, PerfumeBottleOrnament } from './MakeupOrnaments';
import { CornerFlourish, PearlGarland } from './DecorOrnaments';
import { SectionBackdrop } from './SectionBackdrop';

interface AboutSectionProps {
  settings: PublishedSettings;
}

export function AboutSection({ settings }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const photoParallaxRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(
    () =>
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [sweepKey, setSweepKey] = useState(0);

  useEffect(() => {
    const target = photoParallaxRef.current;
    if (!target) return;
    return registerPhotoParallax(target, 10);
  }, []);

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
            setEntered((prev) => {
              if (!prev) setSweepKey((k) => k + 1);
              return true;
            });
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
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const paragraphs = (settings.about_description || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      id="tentang"
      ref={sectionRef}
      className="relative overflow-hidden py-20 sm:py-24 lg:py-28 landing-section-anchor"
    >
      <SectionBackdrop variant="rose" pattern="dots" petals />

      {/* Sapuan Cahaya Sutra Champagne Ringan (Menggantikan Gelembung Meletus) */}
      {sweepKey > 0 && (
        <span
          key={sweepKey}
          aria-hidden="true"
          className="about-silk-sweep pointer-events-none absolute inset-y-0 left-0 z-[5]"
        />
      )}

      <PearlGarland className="pointer-events-none select-none hidden lg:block absolute top-0 right-[8%] w-72 opacity-55 text-[var(--color-champagne)]" />
      <CornerFlourish className="pointer-events-none select-none hidden md:block absolute bottom-4 left-4 w-24 lg:w-32 opacity-40 -rotate-90 text-[var(--color-champagne)]" />
      <PerfumeBottleOrnament className="pointer-events-none select-none hidden md:block absolute top-8 left-2 xl:left-8 w-32 lg:w-40 opacity-30 text-[var(--color-accent)] animate-float-slow" />
      <HeroFloralBottomRight className="pointer-events-none select-none absolute -bottom-6 -right-6 w-40 sm:w-52 opacity-25 text-[var(--color-accent)]" />

      <ScrollStage className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">
          {/* Kolom Kiri: Komposisi Bingkai Arch Masuk Halus dari Kiri */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[370px] lg:max-w-none">
              <BeautySparkleCluster className="pointer-events-none select-none absolute -top-5 -left-5 w-16 opacity-50 text-[var(--color-accent)] animate-twinkle" />

              {/* Garis Bingkai Arch Champagne Bayangan Masuk Sedikit Menyusul */}
              <div
                aria-hidden="true"
                className={`about-arch-outline absolute inset-0 rounded-t-[180px] rounded-b-[1.75rem] border ${
                  entered ? 'is-ready' : ''
                }`}
                style={{
                  borderColor: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
                  transitionDelay: '180ms',
                }}
              />

              {/* Bingkai Foto Arch Utama Masuk Meluncur Lembut dari Kiri */}
              <div
                className={`about-arch-card relative aspect-[4/5] w-full rounded-t-[180px] rounded-b-[1.75rem] p-2 border shadow-[0_18px_44px_-30px_rgba(143,69,75,0.24)] ${
                  entered ? 'is-ready' : ''
                }`}
                style={{
                  borderColor: 'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--color-ivory) 88%, transparent)',
                  transitionDelay: '60ms',
                }}
              >
                <div
                  className="relative w-full h-full overflow-hidden rounded-t-[172px] rounded-b-[1.35rem]"
                  style={{ backgroundColor: 'var(--color-ivory)' }}
                >
                  <div ref={photoParallaxRef} className="w-full h-full">
                    <div
                      className={`about-arch-photo w-full h-full ${entered ? 'is-ready' : ''}`}
                    >
                      <SmartImage
                        src={settings.about_image_url}
                        alt={settings.about_media_alt || `Tentang ${settings.business_name}`}
                        focusX={settings.about_media_focus_x}
                        focusY={settings.about_media_focus_y}
                        zoom={settings.about_media_zoom}
                        loading="lazy"
                        fallbackLabel="Foto profil & studio"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Koreografi Cerita Editorial (Garis Menarik Sendiri + Paragraf dari Kanan) */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-3">
              <span
                className={`hero-line-draw inline-block h-px w-9 opacity-55 ${
                  entered ? 'is-ready' : ''
                }`}
                style={{
                  backgroundColor: 'var(--color-accent)',
                  transitionDelay: '80ms',
                }}
                aria-hidden="true"
              />
              <span
                className={`about-story-right text-[11px] uppercase tracking-[0.28em] font-medium ${
                  entered ? 'is-ready' : ''
                }`}
                style={{
                  color: 'var(--color-accent)',
                  transitionDelay: '110ms',
                }}
              >
                <FormattedText text={settings.site_copy?.about_eyebrow?.trim() || 'Tentang Kami'} />
              </span>
            </div>

            <h2
              className="landing-serif mt-3.5 text-3xl sm:text-4xl lg:text-[2.9rem] font-normal leading-tight"
              style={{ color: 'var(--color-heading)' }}
            >
              <LineRevealTitle text={settings.about_title} baseDelay={140} active={entered} />
            </h2>

            {paragraphs.length > 0 && (
              <div className="relative mt-6 pl-5 space-y-4 text-sm sm:text-base leading-relaxed opacity-90">
                {/* Garis Vertikal Editorial Memanjang Halus dari Atas ke Bawah */}
                <span
                  aria-hidden="true"
                  className={`about-story-line absolute left-0 top-1 bottom-1 w-[2px] rounded-full ${
                    entered ? 'is-ready' : ''
                  }`}
                  style={{
                    background:
                      'linear-gradient(180deg, var(--color-accent), var(--color-champagne))',
                    opacity: 0.45,
                    transitionDelay: '220ms',
                  }}
                />
                {paragraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={`about-story-right ${entered ? 'is-ready' : ''}`}
                    style={{
                      color: 'var(--color-body)',
                      transitionDelay: `${260 + idx * 95}ms`,
                    }}
                  >
                    <FormattedText text={paragraph} />
                  </p>
                ))}
              </div>
            )}

            {settings.about_service_area.trim() && (
              <div
                className={`about-badge-in mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm border shadow-xs ${
                  entered ? 'is-ready' : ''
                }`}
                style={{
                  backgroundColor: 'var(--color-ivory)',
                  borderColor: 'color-mix(in srgb, var(--color-accent) 26%, transparent)',
                  color: 'var(--color-heading)',
                  transitionDelay: `${340 + paragraphs.length * 90}ms`,
                }}
              >
                <MapPin className="w-4 h-4 shrink-0 text-[var(--color-accent)]" />
                <span>
                  Area layanan: <FormattedText text={settings.about_service_area} />
                </span>
              </div>
            )}
          </div>
        </div>
      </ScrollStage>
    </section>
  );
}
