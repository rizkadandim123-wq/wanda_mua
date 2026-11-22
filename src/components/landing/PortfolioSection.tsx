import { useEffect, useMemo, useRef, useState } from 'react';
import { Expand } from 'lucide-react';
import type {
  PublishedCategory,
  PublishedPortfolioItem,
  PublishedSettings,
} from '../../types/cms';
import { LineRevealTitle, ScrollStage } from '../common/EditorialMotion';
import { FormattedText, stripTextFormatting } from '../common/FormattedTitle';
import { SmartImage } from '../common/SmartImage';
import {
  HandMirrorOrnament,
  MakeupDivider,
  MakeupPaletteOrnament,
} from './MakeupOrnaments';
import { CornerFlourish } from './DecorOrnaments';
import { SectionBackdrop } from './SectionBackdrop';
import { PortfolioLightbox } from './PortfolioLightbox';

interface PortfolioSectionProps {
  settings: PublishedSettings;
  categories: PublishedCategory[];
  items: PublishedPortfolioItem[];
}

interface LookbookTileLayout {
  colClass: string;
  mediaBoxClass: string;
}

/**
 * Tata letak Bento Editorial seragam (tanpa bingkai belang/arch aneh & tanpa baris yatim):
 * Semua foto memakai bingkai print galeri yang sama persis, sementara proporsi kolom
 * bergantian seimbang (7+5, 5+7, atau trio 4+4+4) sehingga setiap baris rata rapi.
 */
function getEditorialTileLayout(idx: number, total: number): LookbookTileLayout {
  if (total === 1) {
    return {
      colClass: 'sm:col-span-2 lg:col-span-6 lg:col-start-4',
      mediaBoxClass: 'aspect-[4/5]',
    };
  }
  if (total === 2) {
    return {
      colClass: 'sm:col-span-1 lg:col-span-6',
      mediaBoxClass: 'aspect-[4/4.5]',
    };
  }
  if (total === 3) {
    return {
      colClass: 'sm:col-span-1 lg:col-span-4',
      mediaBoxClass: 'aspect-[4/5]',
    };
  }

  // Untuk jumlah ganjil >= 5 (5, 7, 9...), 3 kartu terakhir menjadi trio rata (4 + 4 + 4)
  const hasTrailingTrio = total >= 5 && total % 2 === 1;
  const pairLimit = hasTrailingTrio ? total - 3 : total;

  if (idx >= pairLimit) {
    return {
      colClass: 'sm:col-span-1 lg:col-span-4',
      mediaBoxClass: 'aspect-[4/5]',
    };
  }

  // Baris berpasangan bergantian: [7 + 5] lalu [5 + 7] dengan tinggi seragam di desktop
  const rowIndex = Math.floor(idx / 2);
  const posInRow = idx % 2;
  const isWide = rowIndex % 2 === 0 ? posInRow === 0 : posInRow === 1;

  return {
    colClass: isWide ? 'sm:col-span-1 lg:col-span-7' : 'sm:col-span-1 lg:col-span-5',
    mediaBoxClass: 'aspect-[4/4.6] lg:aspect-auto lg:h-[420px] xl:h-[450px]',
  };
}

export function PortfolioSection({ settings, categories, items }: PortfolioSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
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
            if (rect.top > vh + 140 || rect.bottom < -140) {
              setEntered(false);
            }
          }
        }
      },
      {
        threshold: 0.06,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const categoryNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) {
      map[cat.id] = cat.name;
    }
    return map;
  }, [categories]);

  const activeCategories = useMemo(() => {
    const usedIds = new Set(items.map((item) => item.category_id));
    return categories.filter((cat) => usedIds.has(cat.id));
  }, [categories, items]);

  const effectiveCategory =
    selectedCategory === 'all' || activeCategories.some((c) => c.id === selectedCategory)
      ? selectedCategory
      : 'all';

  const filteredItems = useMemo(() => {
    if (effectiveCategory === 'all') return items;
    return items.filter((item) => item.category_id === effectiveCategory);
  }, [effectiveCategory, items]);

  return (
    <section
      id="portofolio"
      ref={sectionRef}
      className="relative overflow-hidden py-20 sm:py-24 lg:py-28 landing-section-anchor"
    >
      <SectionBackdrop variant="champagne" pattern="lace" />
      <CornerFlourish className="pointer-events-none select-none hidden md:block absolute top-4 right-4 w-24 lg:w-32 opacity-45 rotate-90 text-[var(--color-champagne)]" />
      <CornerFlourish className="pointer-events-none select-none hidden md:block absolute bottom-4 left-4 w-24 lg:w-32 opacity-45 -rotate-90 text-[var(--color-champagne)]" />
      <MakeupPaletteOrnament className="pointer-events-none select-none hidden lg:block absolute top-12 left-3 xl:left-8 w-40 xl:w-48 opacity-30 text-[var(--color-accent)] animate-float-slow" />
      <HandMirrorOrnament className="pointer-events-none select-none hidden lg:block absolute bottom-10 right-3 xl:right-8 w-32 xl:w-40 opacity-30 text-[var(--color-accent)] animate-float-delayed" />

      <ScrollStage className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Lookbook: Garis Membuka Simetris dari Tengah + Iris Fade */}
        <div className="max-w-2xl mx-auto text-center">
          <div className={`portfolio-head-bloom ${entered ? 'is-ready' : ''}`}>
            <MakeupDivider className="mb-4 text-[var(--color-accent)]" />
            <div className="inline-flex items-center justify-center gap-3 mb-2">
              <span
                className={`portfolio-rule-expand inline-block h-px w-10 opacity-50 ${
                  entered ? 'is-ready' : ''
                }`}
                style={{ backgroundColor: 'var(--color-accent)' }}
                aria-hidden="true"
              />
              <span
                className="text-[11px] uppercase tracking-[0.28em] font-medium"
                style={{ color: 'var(--color-accent)' }}
              >
                <FormattedText text={settings.site_copy?.portfolio_eyebrow?.trim() || 'Beauty Lookbook'} />
              </span>
              <span
                className={`portfolio-rule-expand inline-block h-px w-10 opacity-50 ${
                  entered ? 'is-ready' : ''
                }`}
                style={{ backgroundColor: 'var(--color-accent)' }}
                aria-hidden="true"
              />
            </div>
          </div>

          <h2
            className="landing-serif text-3xl sm:text-4xl lg:text-[2.95rem] font-normal leading-tight"
            style={{ color: 'var(--color-heading)' }}
          >
            <LineRevealTitle text={settings.portfolio_title} baseDelay={60} active={entered} />
          </h2>

          {settings.portfolio_subtitle && (
            <p
              className={`portfolio-head-bloom mt-4 text-sm sm:text-base leading-relaxed opacity-85 ${
                entered ? 'is-ready' : ''
              }`}
              style={{
                color: 'var(--color-body)',
                transitionDelay: '150ms',
              }}
            >
              <FormattedText text={settings.portfolio_subtitle} />
            </p>
          )}
        </div>

        {/* Filter Kategori */}
        {activeCategories.length > 0 && (
          <div
            className={`portfolio-head-bloom mt-10 flex flex-wrap items-center justify-center gap-2.5 ${
              entered ? 'is-ready' : ''
            }`}
            style={{ transitionDelay: '210ms' }}
            role="tablist"
            aria-label="Filter kategori portofolio"
          >
            <button
              type="button"
              role="tab"
              aria-selected={effectiveCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
              className="rounded-full px-5 py-2 text-xs sm:text-sm font-medium border transition-colors duration-200 cursor-pointer"
              style={
                effectiveCategory === 'all'
                  ? {
                      backgroundColor: 'var(--color-accent)',
                      borderColor: 'var(--color-accent)',
                      color: '#FFF9F5',
                    }
                  : {
                      backgroundColor: 'transparent',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
                      color: 'var(--color-body)',
                    }
              }
            >
              Semua
            </button>
            {activeCategories.map((cat) => {
              const isSelected = effectiveCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="rounded-full px-5 py-2 text-xs sm:text-sm font-medium border transition-colors duration-200 cursor-pointer"
                  style={
                    isSelected
                      ? {
                          backgroundColor: 'var(--color-accent)',
                          borderColor: 'var(--color-accent)',
                          color: '#FFF9F5',
                        }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
                          color: 'var(--color-body)',
                        }
                  }
                >
                  <FormattedText text={cat.name} />
                </button>
              );
            })}
          </div>
        )}

        {/* Galeri Editorial Bento dengan Bingkai Seragam Mewah + Animasi 3D Print Settle */}
        {filteredItems.length === 0 ? (
          <p className="mt-10 text-center text-sm opacity-75">
            Belum ada foto portofolio yang dipublikasikan.
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-7">
            {filteredItems.map((item, idx) => {
              const layout = getEditorialTileLayout(idx, filteredItems.length);
              const tileDelay = 120 + Math.min(idx, 7) * 95;

              return (
                <div
                  key={item.id}
                  className={`portfolio-tile-bloom ${layout.colClass} ${
                    entered ? 'is-ready' : ''
                  }`}
                  style={{ transitionDelay: `${tileDelay}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="group block w-full text-left rounded-[1.55rem] p-2.5 border transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_22px_42px_-26px_rgba(143,69,75,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] cursor-pointer"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-ivory) 92%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
                    }}
                    aria-label={`Buka foto ${stripTextFormatting(item.title)}`}
                  >
                    {/* Bingkai Foto Seragam dengan Lens Focus Settle Halus */}
                    <div
                      className={`relative w-full overflow-hidden rounded-[1.1rem] ${layout.mediaBoxClass}`}
                      style={{ backgroundColor: 'var(--color-blush)' }}
                    >
                      <div
                        className={`portfolio-lens-photo w-full h-full ${
                          entered ? 'is-ready' : ''
                        }`}
                        style={{ transitionDelay: `${tileDelay + 40}ms` }}
                      >
                        <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.045]">
                          <SmartImage
                            src={item.image_url}
                            alt={item.alt_text || item.title}
                            focusX={item.image_focus_x}
                            focusY={item.image_focus_y}
                            zoom={item.image_zoom}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Hairline Tipis di Dalam Foto */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-2.5 rounded-[0.8rem] border opacity-45 group-hover:opacity-80 transition-opacity duration-300"
                        style={{ borderColor: 'rgba(255, 249, 245, 0.58)' }}
                      />

                      {/* Ikon Perbesar Minimalis di Sudut Kanan Atas */}
                      <span
                        className="absolute top-3.5 right-3.5 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full border opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                        style={{
                          backgroundColor: 'rgba(255, 249, 245, 0.9)',
                          borderColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
                          color: 'var(--color-heading)',
                        }}
                        aria-hidden="true"
                      >
                        <Expand className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Caption Rapi di Margin Bawah Kartu Galeri */}
                    <div className="px-2 pt-3 pb-1 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span
                          className="block text-[10px] uppercase tracking-[0.24em] font-semibold opacity-80 truncate"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          <FormattedText text={categoryNames[item.category_id] ?? 'Portofolio'} />
                        </span>
                        <p
                          className="landing-serif text-lg sm:text-[1.25rem] leading-snug truncate mt-0.5 transition-opacity group-hover:opacity-80"
                          style={{ color: 'var(--color-heading)' }}
                        >
                          <FormattedText text={item.title} />
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </ScrollStage>

      <PortfolioLightbox
        items={filteredItems}
        activeIndex={lightboxIndex}
        categoryNames={categoryNames}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </section>
  );
}
