import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import type { PublishedSettings, PublishedTestimonial } from '../../types/cms';
import { LineRevealTitle, ScrollStage } from '../common/EditorialMotion';
import { FormattedText } from '../common/FormattedTitle';
import { BotanicalDivider } from './FloralOrnaments';
import { LashWandOrnament, LipGlossOrnament } from './MakeupOrnaments';
import { CornerFlourish, PearlGarland } from './DecorOrnaments';
import { SectionBackdrop } from './SectionBackdrop';

interface TestimonialsSectionProps {
  settings: PublishedSettings;
  testimonials: PublishedTestimonial[];
}

export function TestimonialsSection({ settings, testimonials }: TestimonialsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(
    () =>
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (testimonials.length === 0) return;
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
            if (rect.top > vh + 140 || rect.bottom < -140) {
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
  }, [testimonials.length]);

  // Jangan tampilkan bagian ini bila belum ada testimoni asli yang dipublikasikan
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section
      id="testimoni"
      ref={sectionRef}
      className="relative overflow-hidden py-18 sm:py-22 lg:py-26 landing-section-anchor"
    >
      <SectionBackdrop variant="rose" pattern="damask" petals />
      <PearlGarland className="pointer-events-none select-none hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-80 lg:w-96 opacity-50 text-[var(--color-champagne)]" />
      <CornerFlourish className="pointer-events-none select-none hidden md:block absolute bottom-4 left-4 w-24 lg:w-32 opacity-40 -rotate-90 text-[var(--color-champagne)]" />
      <LashWandOrnament className="pointer-events-none select-none hidden lg:block absolute top-12 left-4 xl:left-10 w-32 xl:w-36 opacity-28 text-[var(--color-accent)] animate-float-slow" />
      <LipGlossOrnament className="pointer-events-none select-none hidden lg:block absolute bottom-10 right-4 xl:right-10 w-30 xl:w-36 opacity-28 text-[var(--color-accent)] animate-float-delayed" />

      <ScrollStage className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className={`testi-head-soft ${entered ? 'is-ready' : ''}`}>
            <BotanicalDivider className="mb-4 text-[var(--color-accent)]" />
            <span
              className="block text-[11px] uppercase tracking-[0.28em] font-medium mb-2"
              style={{ color: 'var(--color-accent)' }}
            >
              <FormattedText text={settings.site_copy?.testimonials_eyebrow?.trim() || 'Kind Words'} />
            </span>
          </div>

          <h2
            className="landing-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-normal leading-tight"
            style={{ color: 'var(--color-heading)' }}
          >
            <LineRevealTitle text={settings.testimonials_title} baseDelay={60} active={entered} />
          </h2>

          {settings.testimonials_subtitle && (
            <p
              className={`testi-head-soft mt-4 text-sm sm:text-base leading-relaxed opacity-85 ${
                entered ? 'is-ready' : ''
              }`}
              style={{
                color: 'var(--color-body)',
                transitionDelay: '140ms',
              }}
            >
              <FormattedText text={settings.testimonials_subtitle} />
            </p>
          )}
        </div>

        {/* Kartu Testimoni: Efek Membuka Kipas Kartu Ucapan (Fan-Out) + Bintang Berkilau Beruntun */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {testimonials.map((item, idx) => {
            const stars = Math.min(5, Math.max(1, Math.round(item.rating ?? 5)));
            const fanSlot = idx % 3 === 0 ? 'left' : idx % 3 === 1 ? 'center' : 'right';
            const cardDelay = 120 + Math.min(idx, 5) * 115;

            return (
              <div
                key={item.id}
                className={`testi-card-fan testi-fan-${fanSlot} h-full ${
                  entered ? 'is-ready' : ''
                }`}
                style={{ transitionDelay: `${cardDelay}ms` }}
              >
                <article
                  className="relative h-full rounded-3xl border p-6 sm:p-8 flex flex-col justify-between gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_-26px_rgba(143,69,75,0.28)]"
                  style={{
                    backgroundColor: 'var(--color-ivory)',
                    borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
                  }}
                >
                  {/* Tanda kutip editorial muncul lembut */}
                  <span
                    aria-hidden="true"
                    className={`testi-quote-mark landing-serif pointer-events-none absolute top-3 right-6 text-6xl leading-none select-none ${
                      entered ? 'is-ready' : ''
                    }`}
                    style={{
                      color: 'var(--color-accent)',
                      transitionDelay: `${cardDelay + 220}ms`,
                    }}
                  >
                    ”
                  </span>

                  <div className="space-y-4 relative z-10">
                    {/* Bintang rating berkilau muncul satu per satu */}
                    <div
                      className="flex items-center gap-1"
                      aria-label={`Rating ${stars} dari 5 bintang`}
                    >
                      {Array.from({ length: 5 }).map((_, starIdx) => {
                        const filled = starIdx < stars;
                        return (
                          <span
                            key={starIdx}
                            className={`testi-star-pop inline-flex ${entered ? 'is-ready' : ''}`}
                            style={{
                              transitionDelay: `${cardDelay + 170 + starIdx * 55}ms`,
                            }}
                          >
                            <Star
                              className="w-4 h-4"
                              style={{
                                color: 'var(--color-accent)',
                                fill: filled ? 'var(--color-accent)' : 'transparent',
                                opacity: filled ? 1 : 0.3,
                              }}
                              aria-hidden="true"
                            />
                          </span>
                        );
                      })}
                    </div>

                    <p
                      className="text-sm sm:text-[15px] leading-relaxed"
                      style={{ color: 'var(--color-body)' }}
                    >
                      “<FormattedText text={item.quote} />”
                    </p>
                  </div>

                  <div className="relative pt-3.5 flex items-center justify-between gap-2">
                    {/* Garis pemisah tipis menggambar diri kiri -> kanan */}
                    <span
                      aria-hidden="true"
                      className={`testi-footer-rule absolute top-0 inset-x-0 h-px ${
                        entered ? 'is-ready' : ''
                      }`}
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
                        transitionDelay: `${cardDelay + 240}ms`,
                      }}
                    />

                    <p
                      className="landing-serif text-lg font-medium"
                      style={{ color: 'var(--color-heading)' }}
                    >
                      <FormattedText text={item.client_name} />
                    </p>
                    <span
                      className="h-1.5 w-1.5 rounded-full opacity-55"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                      aria-hidden="true"
                    />
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </ScrollStage>
    </section>
  );
}
