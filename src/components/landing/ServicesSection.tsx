import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type {
  PublishedService,
  PublishedServiceCategory,
  PublishedSettings,
} from '../../types/cms';
import { LineRevealTitle, ScrollStage, useSectionRevealed } from '../common/EditorialMotion';
import { FormattedText, stripTextFormatting } from '../common/FormattedTitle';
import { SmartImage } from '../common/SmartImage';
import {
  MakeupDivider,
  MakeupLipstickOrnament,
  PowderCompactOrnament,
} from './MakeupOrnaments';
import { CornerFlourish } from './DecorOrnaments';
import { SectionBackdrop } from './SectionBackdrop';
import { ServiceDetailModal } from './ServiceDetailModal';

interface ServicesSectionProps {
  settings: PublishedSettings;
  categories: PublishedServiceCategory[];
  services: PublishedService[];
}

interface ServicePhotoLook {
  key: 'pearl' | 'champagne' | 'velvet';
  photoClass: string;
  tintOverlayClass: string;
  labelPlateStyle: {
    backgroundColor: string;
    borderColor: string;
  };
}

/**
 * 3 karakter pencahayaan & color grading foto berbeda yang ringan (GPU-friendly)
 * dan otomatis berulang per 3 layanan (foto ke-4 mengikuti foto ke-1, dst).
 */
const SERVICE_PHOTO_LOOKS: ServicePhotoLook[] = [
  {
    // Foto 1, 4, 7...: Soft Pearl Rose — meredam silau berlebih lalu memberi bias rona rose-ivory lembut
    key: 'pearl',
    photoClass: 'service-photo-look-pearl',
    tintOverlayClass: 'service-tint-pearl',
    labelPlateStyle: {
      backgroundColor: 'rgba(255, 249, 245, 0.92)',
      borderColor: 'rgba(255, 249, 245, 0.96)',
    },
  },
  {
    // Foto 2, 5, 8...: Golden Champagne — hangat keemasan & kilau matahari halus dari kanan atas
    key: 'champagne',
    photoClass: 'service-photo-look-champagne',
    tintOverlayClass: 'service-tint-champagne',
    labelPlateStyle: {
      backgroundColor: 'rgba(255, 247, 241, 0.92)',
      borderColor: 'color-mix(in srgb, var(--color-champagne) 40%, rgba(255, 255, 255, 0.94))',
    },
  },
  {
    // Foto 3, 6, 9...: Velvet Rose Studio — kontras lembut + sorotan cerah wajah & aura rose di tepi
    key: 'velvet',
    photoClass: 'service-photo-look-velvet',
    tintOverlayClass: 'service-tint-velvet',
    labelPlateStyle: {
      backgroundColor: 'rgba(253, 244, 247, 0.92)',
      borderColor: 'color-mix(in srgb, var(--color-accent) 26%, rgba(255, 255, 255, 0.94))',
    },
  },
];

interface ServicesInnerProps {
  settings: PublishedSettings;
  activeCategories: PublishedServiceCategory[];
  effectiveCategory: string;
  onSelectCategory: (catId: string) => void;
  filteredServices: PublishedService[];
  categoryNames: Record<string, string>;
  onSelectService: (service: PublishedService) => void;
}

function ServicesChoreographedContent({
  settings,
  activeCategories,
  effectiveCategory,
  onSelectCategory,
  filteredServices,
  categoryNames,
  onSelectService,
}: ServicesInnerProps) {
  const revealed = useSectionRevealed();

  const gridLayoutClass =
    filteredServices.length === 1
      ? 'max-w-sm mx-auto grid-cols-1'
      : filteredServices.length === 2
        ? 'max-w-3xl mx-auto grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <>
      {/* Header Section: Fade In Ringan & Halus Tepat Setelah Gelembung Pecah */}
      <div className="max-w-2xl mx-auto text-center">
        <div
          className={`service-header-item ${revealed ? 'is-ready' : ''}`}
          style={{ transitionDelay: '0ms' }}
        >
          <MakeupDivider className="mb-4 text-[var(--color-accent)]" />
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <span
              className={`hero-line-draw inline-block h-px w-8 opacity-55 ${
                revealed ? 'is-ready' : ''
              }`}
              style={{
                backgroundColor: 'var(--color-accent)',
                transitionDelay: '40ms',
              }}
              aria-hidden="true"
            />
            <span
              className="text-[11px] uppercase tracking-[0.28em] font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              <FormattedText text={settings.site_copy?.services_eyebrow?.trim() || 'Curated Services'} />
            </span>
            <span
              className={`hero-line-draw inline-block h-px w-8 opacity-55 ${
                revealed ? 'is-ready' : ''
              }`}
              style={{
                backgroundColor: 'var(--color-champagne)',
                transitionDelay: '70ms',
              }}
              aria-hidden="true"
            />
          </div>
        </div>

        <h2
          className="landing-serif text-3xl sm:text-4xl lg:text-[2.95rem] font-normal leading-tight"
          style={{ color: 'var(--color-heading)' }}
        >
          <LineRevealTitle text={settings.services_title} baseDelay={45} active={revealed} />
        </h2>

        {settings.services_subtitle && (
          <p
            className={`service-header-item mt-4 text-sm sm:text-base leading-relaxed opacity-85 ${
              revealed ? 'is-ready' : ''
            }`}
            style={{
              color: 'var(--color-body)',
              transitionDelay: '130ms',
            }}
          >
            <FormattedText text={settings.services_subtitle} />
          </p>
        )}
      </div>

      {/* Filter Kategori Layanan */}
      {activeCategories.length > 0 && (
        <div
          className={`service-header-item mt-10 flex flex-wrap items-center justify-center gap-2.5 ${
            revealed ? 'is-ready' : ''
          }`}
          style={{ transitionDelay: '185ms' }}
          role="tablist"
          aria-label="Filter kategori layanan"
        >
          <button
            type="button"
            role="tab"
            aria-selected={effectiveCategory === 'all'}
            onClick={() => onSelectCategory('all')}
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
                onClick={() => onSelectCategory(cat.id)}
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

      {/* Grid Potret Seragam: Masuk Mulus dari Kanan ke Kiri + Fade-In Ringan (60fps) */}
      {filteredServices.length === 0 ? (
        <p className="mt-10 text-center text-sm opacity-75">
          Daftar layanan sedang diperbarui.
        </p>
      ) : (
        <div className={`mt-14 grid gap-7 lg:gap-8 ${gridLayoutClass}`}>
          {filteredServices.map((service, index) => {
            const catLabel = service.category_id ? categoryNames[service.category_id] : null;
            const look = SERVICE_PHOTO_LOOKS[index % SERVICE_PHOTO_LOOKS.length];
            const cardDelay = 110 + Math.min(index, 5) * 115;

            return (
              <div
                key={service.id}
                className={`service-card-glide ${revealed ? 'is-ready' : ''}`}
                style={{ transitionDelay: `${cardDelay}ms` }}
              >
                <button
                  type="button"
                  onClick={() => onSelectService(service)}
                  aria-label={`Lihat detail layanan ${stripTextFormatting(service.name)}`}
                  className="service-editorial-card group relative block w-full aspect-[3/4] overflow-hidden rounded-[1.75rem] border text-left transition-transform duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_44px_-26px_rgba(143,69,75,0.34)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-blush)',
                    borderColor: 'color-mix(in srgb, var(--color-accent) 22%, transparent)',
                  }}
                >
                  {/* Foto Potret Cerah dengan 3 Preset Warna Ringan Berulang */}
                  <div
                    className={`w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.045] ${look.photoClass}`}
                  >
                    <SmartImage
                      src={service.image_url}
                      alt={service.image_alt || service.name}
                      focusX={service.image_focus_x}
                      focusY={service.image_focus_y}
                      zoom={service.image_zoom}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Lapisan Pencahayaan & Nuansa Warna Ringan (Tanpa Blend-Mode Berat) */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 ${look.tintOverlayClass}`}
                  />

                  {/* Bingkai Hairline Halus Seragam di Dalam Potret */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-3 rounded-[1.2rem] border transition-opacity duration-300 opacity-55 group-hover:opacity-90"
                    style={{ borderColor: 'rgba(255, 249, 245, 0.56)' }}
                  />

                  {/* Panel Label Soft Blush Ringan di Bawah (Menyusul Masuk dari Kanan) */}
                  <div
                    className={`service-label-plate absolute inset-x-3.5 bottom-3.5 z-10 rounded-[1.25rem] px-4 py-3.5 sm:px-5 sm:py-4 border ${
                      revealed ? 'is-ready' : ''
                    }`}
                    style={{
                      backgroundColor: look.labelPlateStyle.backgroundColor,
                      borderColor: look.labelPlateStyle.borderColor,
                      boxShadow: '0 10px 24px -16px rgba(143, 69, 75, 0.3)',
                      transitionDelay: `${cardDelay + 140}ms`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span
                          className="block text-[10px] uppercase tracking-[0.24em] font-semibold truncate"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          <FormattedText text={catLabel || 'Layanan Makeup'} />
                        </span>
                        <h3
                          className="landing-serif mt-0.5 text-xl sm:text-[1.45rem] font-normal leading-snug truncate"
                          style={{ color: 'var(--color-heading)' }}
                        >
                          <FormattedText text={service.name} />
                        </h3>
                      </div>

                      <span
                        aria-hidden="true"
                        className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors duration-300 group-hover:bg-[var(--color-accent)] group-hover:border-[var(--color-accent)] group-hover:text-[#FFF9F5]"
                        style={{
                          backgroundColor: 'var(--color-ivory)',
                          borderColor: 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
                          color: 'var(--color-heading)',
                        }}
                      >
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export function ServicesSection({ settings, categories, services }: ServicesSectionProps) {
  const [selectedService, setSelectedService] = useState<PublishedService | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) {
      map[cat.id] = cat.name;
    }
    return map;
  }, [categories]);

  const activeCategories = useMemo(() => {
    const usedIds = new Set(
      services.map((s) => s.category_id).filter((id): id is string => Boolean(id))
    );
    return categories.filter((cat) => usedIds.has(cat.id));
  }, [categories, services]);

  const effectiveCategory =
    selectedCategory === 'all' || activeCategories.some((c) => c.id === selectedCategory)
      ? selectedCategory
      : 'all';

  const filteredServices = useMemo(() => {
    if (effectiveCategory === 'all') return services;
    return services.filter((item) => item.category_id === effectiveCategory);
  }, [effectiveCategory, services]);

  return (
    <section
      id="layanan"
      className="relative py-20 sm:py-24 lg:py-28 landing-section-anchor overflow-hidden"
    >
      <SectionBackdrop variant="ivory" pattern="damask" />
      <CornerFlourish className="pointer-events-none select-none hidden md:block absolute top-4 right-4 w-24 lg:w-32 opacity-45 rotate-90 text-[var(--color-champagne)]" />
      <CornerFlourish className="pointer-events-none select-none hidden md:block absolute bottom-4 left-4 w-24 lg:w-32 opacity-45 -rotate-90 text-[var(--color-champagne)]" />

      {/* Ornamen bertema makeup */}
      <MakeupLipstickOrnament className="pointer-events-none select-none hidden lg:block absolute top-14 left-3 xl:left-8 w-32 xl:w-40 opacity-30 text-[var(--color-accent)] animate-float-slow" />
      <PowderCompactOrnament className="pointer-events-none select-none hidden lg:block absolute bottom-12 right-3 xl:right-8 w-36 xl:w-44 opacity-30 text-[var(--color-accent)] animate-float-delayed" />

      <ScrollStage
        bubbleTransition
        bubbleSide="left"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <ServicesChoreographedContent
          settings={settings}
          activeCategories={activeCategories}
          effectiveCategory={effectiveCategory}
          onSelectCategory={setSelectedCategory}
          filteredServices={filteredServices}
          categoryNames={categoryNames}
          onSelectService={setSelectedService}
        />
      </ScrollStage>

      <ServiceDetailModal
        service={selectedService}
        categoryName={
          selectedService?.category_id ? categoryNames[selectedService.category_id] : null
        }
        whatsappNumber={settings.whatsapp_number}
        onClose={() => setSelectedService(null)}
      />
    </section>
  );
}
