import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Handshake,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { formatIdrCurrency, getPaginationWindow } from '../../lib/pagination';
import { DAYMOMENT_REFERRAL_URL, fetchDaymomentTemplates } from '../../lib/partnerService';
import type { DaymomentTemplate } from '../../types/partner';
import { LineRevealTitle, ScrollStage } from '../common/EditorialMotion';
import { BotanicalDivider } from './FloralOrnaments';
import { BeautySparkleCluster } from './MakeupOrnaments';
import { CornerFlourish } from './DecorOrnaments';
import { SectionBackdrop } from './SectionBackdrop';
import { PartnerTemplateModal } from './PartnerTemplateModal';

const ITEMS_PER_PAGE = 10;
const MAX_VISIBLE_PAGES = 10;

export function PartnerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [templates, setTemplates] = useState<DaymomentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTemplate, setActiveTemplate] = useState<DaymomentTemplate | null>(null);
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
        threshold: 0.05,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchDaymomentTemplates();
      setTemplates(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Katalog undangan digital Daymoment belum dapat dimuat.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tpl of templates) {
      const cat = tpl.category.trim() || 'Template';
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [templates]);

  const effectiveCategory =
    selectedCategory === 'all' || categoryOptions.some((c) => c.name === selectedCategory)
      ? selectedCategory
      : 'all';

  const filteredTemplates = useMemo(() => {
    if (effectiveCategory === 'all') return templates;
    return templates.filter(
      (tpl) => (tpl.category.trim() || 'Template') === effectiveCategory
    );
  }, [effectiveCategory, templates]);

  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
  const safeCurrentPage =
    totalPages > 0 ? Math.min(Math.max(1, currentPage), totalPages) : 1;

  const pageStartIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTemplates = filteredTemplates.slice(
    pageStartIndex,
    pageStartIndex + ITEMS_PER_PAGE
  );

  const pagination = useMemo(
    () => getPaginationWindow(safeCurrentPage, totalPages, MAX_VISIBLE_PAGES),
    [safeCurrentPage, totalPages]
  );

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleChangePage = (nextPage: number) => {
    if (totalPages <= 0) return;
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    if (clamped === safeCurrentPage) return;
    setCurrentPage(clamped);

    const el = sectionRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < 0) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section
      id="partner"
      ref={sectionRef}
      className="relative overflow-hidden py-18 sm:py-22 lg:py-26 landing-section-anchor"
    >
      <SectionBackdrop variant="champagne" pattern="dots" />
      <CornerFlourish className="pointer-events-none select-none hidden md:block absolute top-4 right-4 w-24 lg:w-32 opacity-45 rotate-90 text-[var(--color-champagne)]" />
      <CornerFlourish className="pointer-events-none select-none hidden md:block absolute bottom-4 left-4 w-24 lg:w-32 opacity-45 -rotate-90 text-[var(--color-champagne)]" />

      {/* Kilau sudut dekoratif */}
      <BeautySparkleCluster className="pointer-events-none select-none hidden md:block absolute top-14 left-6 xl:left-12 w-20 opacity-35 text-[var(--color-accent)] animate-twinkle" />
      <BeautySparkleCluster className="pointer-events-none select-none hidden md:block absolute bottom-14 right-6 xl:right-12 w-20 opacity-35 text-[var(--color-accent)] animate-twinkle" />

      <ScrollStage className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className={`partner-seal-pop ${entered ? 'is-ready' : ''}`}>
            <BotanicalDivider className="mb-4 text-[var(--color-accent)]" />

            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.24em] font-medium border mb-3"
              style={{
                backgroundColor: 'var(--color-ivory)',
                borderColor: 'color-mix(in srgb, var(--color-accent) 26%, transparent)',
                color: 'var(--color-accent)',
              }}
            >
              <Handshake className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Partner Kolaborasi · Daymoment</span>
            </div>
          </div>

          <h2
            className="landing-serif text-3xl sm:text-4xl lg:text-[2.95rem] font-normal leading-tight"
            style={{ color: 'var(--color-heading)' }}
          >
            <LineRevealTitle
              text="Undangan Digital bersama *Daymoment*"
              baseDelay={70}
              active={entered}
            />
          </h2>

          <div
            className={`partner-sub-rise ${entered ? 'is-ready' : ''}`}
            style={{ transitionDelay: '150ms' }}
          >
            <p
              className="mt-4 text-sm sm:text-base leading-relaxed opacity-90"
              style={{ color: 'var(--color-body)' }}
            >
              Lengkapi persiapan hari istimewa Anda bersama partner kolaborasi resmi kami{' '}
              <strong className="font-semibold" style={{ color: 'var(--color-heading)' }}>
                Daymoment
              </strong>{' '}
              untuk desain undangan digital yang elegan, interaktif, dan siap pakai.
            </p>

            <div className="mt-4">
              <a
                href={DAYMOMENT_REFERRAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium hover:underline underline-offset-4"
                style={{ color: 'var(--color-accent)' }}
              >
                <span>Kunjungi daymoment.id</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Filter Kategori Template */}
        {!loading && !error && categoryOptions.length > 0 && (
          <div
            className={`partner-tabs-in mt-9 flex flex-wrap items-center justify-center gap-2.5 ${
              entered ? 'is-ready' : ''
            }`}
            style={{ transitionDelay: '220ms' }}
            role="tablist"
            aria-label="Filter kategori template Daymoment"
          >
            <button
              type="button"
              role="tab"
              aria-selected={effectiveCategory === 'all'}
              onClick={() => handleSelectCategory('all')}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium border transition-all duration-200 cursor-pointer"
              style={
                effectiveCategory === 'all'
                  ? {
                      backgroundColor: 'var(--color-accent)',
                      borderColor: 'var(--color-accent)',
                      color: '#FFF9F5',
                    }
                  : {
                      backgroundColor: 'var(--color-ivory)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 26%, transparent)',
                      color: 'var(--color-body)',
                    }
              }
            >
              <span>Semua</span>
              <span
                className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold"
                style={
                  effectiveCategory === 'all'
                    ? { backgroundColor: 'rgba(255,249,245,0.24)', color: '#FFF9F5' }
                    : {
                        backgroundColor: 'var(--color-blush)',
                        color: 'var(--color-heading)',
                      }
                }
              >
                {templates.length}
              </span>
            </button>

            {categoryOptions.map((cat) => {
              const isSelected = effectiveCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectCategory(cat.name)}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium border transition-all duration-200 cursor-pointer"
                  style={
                    isSelected
                      ? {
                          backgroundColor: 'var(--color-accent)',
                          borderColor: 'var(--color-accent)',
                          color: '#FFF9F5',
                        }
                      : {
                          backgroundColor: 'var(--color-ivory)',
                          borderColor: 'color-mix(in srgb, var(--color-accent) 26%, transparent)',
                          color: 'var(--color-body)',
                        }
                  }
                >
                  <span>{cat.name}</span>
                  <span
                    className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold"
                    style={
                      isSelected
                        ? { backgroundColor: 'rgba(255,249,245,0.24)', color: '#FFF9F5' }
                        : {
                            backgroundColor: 'var(--color-blush)',
                            color: 'var(--color-heading)',
                          }
                    }
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Daftar Card Template */}
        {loading ? (
          <div className="mt-11 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {[0, 1, 2].map((skeletonIdx) => (
              <div
                key={skeletonIdx}
                className="rounded-3xl border-2 overflow-hidden animate-pulse"
                style={{
                  backgroundColor: 'var(--color-ivory)',
                  borderColor: 'color-mix(in srgb, var(--color-accent) 55%, transparent)',
                }}
              >
                <div
                  className="aspect-[16/11] w-full"
                  style={{ backgroundColor: 'var(--color-blush)' }}
                />
                <div className="p-5 sm:p-6 space-y-3">
                  <div
                    className="h-4 w-28 rounded-full"
                    style={{ backgroundColor: 'var(--color-blush)' }}
                  />
                  <div
                    className="h-7 w-44 rounded-lg"
                    style={{ backgroundColor: 'var(--color-blush)' }}
                  />
                  <div
                    className="h-12 w-full rounded-lg opacity-70"
                    style={{ backgroundColor: 'var(--color-blush)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="mt-11 max-w-xl mx-auto rounded-3xl border p-7 text-center space-y-4"
            style={{
              backgroundColor: 'var(--color-ivory)',
              borderColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
            }}
          >
            <p className="landing-serif text-2xl" style={{ color: 'var(--color-heading)' }}>
              Katalog Daymoment Sementara Belum Terhubung
            </p>
            <p className="text-sm opacity-85" style={{ color: 'var(--color-body)' }}>
              {error}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => void loadTemplates()}
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-[var(--color-blush)]/55 transition-colors cursor-pointer"
                style={{
                  borderColor: 'color-mix(in srgb, var(--color-accent) 34%, transparent)',
                  color: 'var(--color-heading)',
                }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Muat Ulang</span>
              </button>
              <a
                href={DAYMOMENT_REFERRAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-blush-pill inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: '#FFF9F5',
                }}
              >
                <span>Buka daymoment.id</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <p className="mt-11 text-center text-sm opacity-75">
            Belum ada template undangan yang tersedia pada kategori ini.
          </p>
        ) : (
          <>
            <div className="mt-11 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              {paginatedTemplates.map((tpl, cardIdx) => {
                const coverUrl = tpl.full_thumbnail_url || tpl.full_phone_cover_url;
                const cardDelay = 120 + Math.min(cardIdx, 8) * 85;
                return (
                  <article
                    key={tpl.id}
                    className={`partner-invite-card group flex flex-col rounded-3xl border-2 overflow-hidden transition-shadow duration-300 hover:shadow-[0_18px_36px_-26px_rgba(143,69,75,0.32)] ${
                      entered ? 'is-ready' : ''
                    }`}
                    style={{
                      backgroundColor: 'var(--color-ivory)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 62%, transparent)',
                      transitionDelay: `${cardDelay}ms`,
                    }}
                  >
                    {/* Thumbnail Cover Template */}
                    <button
                      type="button"
                      onClick={() => setActiveTemplate(tpl)}
                      className="relative aspect-[16/11] w-full overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] cursor-pointer"
                      style={{ backgroundColor: 'var(--color-blush)' }}
                      aria-label={`Lihat rincian paket template ${tpl.name}`}
                    >
                      {coverUrl ? (
                        <div
                          className={`partner-cover-glide w-full h-full ${
                            entered ? 'is-ready' : ''
                          }`}
                          style={{ transitionDelay: `${cardDelay + 50}ms` }}
                        >
                          <img
                            src={coverUrl}
                            alt={`Template undangan digital ${tpl.name} — Daymoment`}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-65">
                          <Layers
                            className="w-7 h-7"
                            style={{ color: 'var(--color-accent)' }}
                          />
                          <span className="text-xs font-medium">{tpl.name}</span>
                        </div>
                      )}
                      {/* Kilau Amplop Undangan Sekali Lewat Saat Kartu Terbuka */}
                      <span
                        aria-hidden="true"
                        className={`partner-card-gleam ${entered ? 'is-ready' : ''}`}
                        style={{ animationDelay: `${cardDelay + 240}ms` }}
                      />
                    </button>

                    {/* Isi Kartu */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-5">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] font-semibold border"
                            style={{
                              backgroundColor: 'var(--color-blush)',
                              borderColor:
                                'color-mix(in srgb, var(--color-accent) 20%, transparent)',
                              color: 'var(--color-heading)',
                            }}
                          >
                            {tpl.category}
                          </span>

                          <button
                            type="button"
                            onClick={() => setActiveTemplate(tpl)}
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] font-semibold hover:bg-[var(--color-blush)]/65 transition-colors cursor-pointer"
                            style={{ color: 'var(--color-accent)' }}
                            title="Lihat rincian harga & fitur setiap paket"
                          >
                            <span>{tpl.package_count} Paket</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTemplate(tpl)}
                          className="mt-3 block text-left focus:outline-none focus-visible:underline cursor-pointer"
                        >
                          <h3
                            className="landing-serif text-2xl sm:text-[1.65rem] font-normal leading-snug"
                            style={{ color: 'var(--color-heading)' }}
                          >
                            {tpl.name}
                          </h3>
                        </button>

                        {tpl.description && (
                          <p
                            className="mt-2 text-sm leading-relaxed opacity-85 line-clamp-3"
                            style={{ color: 'var(--color-body)' }}
                          >
                            {tpl.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        {tpl.starting_price !== null && (
                          <p
                            className="text-sm font-semibold"
                            style={{ color: 'var(--color-heading)' }}
                          >
                            Mulai {formatIdrCurrency(tpl.starting_price)}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2.5">
                          <a
                            href={tpl.preview_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-full border px-3.5 py-2.5 text-xs sm:text-sm font-medium hover:bg-[var(--color-blush)]/60 transition-colors text-center"
                            style={{
                              borderColor:
                                'color-mix(in srgb, var(--color-accent) 34%, transparent)',
                              color: 'var(--color-heading)',
                            }}
                          >
                            Lihat Preview
                          </a>
                          <a
                            href={tpl.order_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-blush-pill inline-flex items-center justify-center rounded-full px-3.5 py-2.5 text-xs sm:text-sm font-medium text-center"
                            style={{
                              backgroundColor: 'var(--color-accent)',
                              color: '#FFF9F5',
                            }}
                          >
                            Pilih Template
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Berjendela (Maks 10 Item/Page & Maks 10 Nomor Page/Window) */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-xs opacity-75" style={{ color: 'var(--color-body)' }}>
                  Menampilkan {pageStartIndex + 1}–
                  {Math.min(pageStartIndex + ITEMS_PER_PAGE, filteredTemplates.length)} dari{' '}
                  {filteredTemplates.length} template
                </p>

                <nav
                  className="flex flex-wrap items-center justify-center gap-1.5"
                  aria-label="Navigasi halaman katalog Daymoment"
                >
                  <button
                    type="button"
                    onClick={() => handleChangePage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage <= 1}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-[var(--color-blush)]/60"
                    style={{
                      backgroundColor: 'var(--color-ivory)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
                      color: 'var(--color-heading)',
                    }}
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {pagination.hasPrevWindow && (
                    <button
                      type="button"
                      onClick={() => handleChangePage(pagination.prevWindowTarget)}
                      className="inline-flex items-center justify-center min-w-[36px] h-9 px-2.5 rounded-full border text-xs font-medium transition-colors cursor-pointer hover:bg-[var(--color-blush)]/60"
                      style={{
                        backgroundColor: 'var(--color-ivory)',
                        borderColor: 'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                        color: 'var(--color-heading)',
                      }}
                      aria-label={`Lihat halaman ${pagination.prevWindowTarget}`}
                    >
                      ...
                    </button>
                  )}

                  {pagination.pages.map((pageNumber) => {
                    const isActive = pageNumber === safeCurrentPage;
                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => handleChangePage(pageNumber)}
                        aria-current={isActive ? 'page' : undefined}
                        className="inline-flex items-center justify-center min-w-[36px] h-9 px-2.5 rounded-full border text-xs sm:text-sm font-medium transition-colors cursor-pointer tabular-nums"
                        style={
                          isActive
                            ? {
                                backgroundColor: 'var(--color-accent)',
                                borderColor: 'var(--color-accent)',
                                color: '#FFF9F5',
                              }
                            : {
                                backgroundColor: 'var(--color-ivory)',
                                borderColor:
                                  'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                                color: 'var(--color-heading)',
                              }
                        }
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  {pagination.hasNextWindow && (
                    <button
                      type="button"
                      onClick={() => handleChangePage(pagination.nextWindowTarget)}
                      className="inline-flex items-center justify-center min-w-[36px] h-9 px-2.5 rounded-full border text-xs font-medium transition-colors cursor-pointer hover:bg-[var(--color-blush)]/60"
                      style={{
                        backgroundColor: 'var(--color-ivory)',
                        borderColor: 'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                        color: 'var(--color-heading)',
                      }}
                      aria-label={`Lihat halaman ${pagination.nextWindowTarget}`}
                    >
                      ...
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleChangePage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage >= totalPages}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-[var(--color-blush)]/60"
                    style={{
                      backgroundColor: 'var(--color-ivory)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
                      color: 'var(--color-heading)',
                    }}
                    aria-label="Halaman berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </ScrollStage>

      <PartnerTemplateModal
        template={activeTemplate}
        onClose={() => setActiveTemplate(null)}
      />
    </section>
  );
}
