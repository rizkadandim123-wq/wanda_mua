import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PublishedPortfolioItem } from '../../types/cms';
import { FormattedText, stripTextFormatting } from '../common/FormattedTitle';
import { SmartImage } from '../common/SmartImage';

interface PortfolioLightboxProps {
  items: PublishedPortfolioItem[];
  activeIndex: number | null;
  categoryNames: Record<string, string>;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}

export function PortfolioLightbox({
  items,
  activeIndex,
  categoryNames,
  onClose,
  onChangeIndex,
}: PortfolioLightboxProps) {
  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < items.length;
  const activeItem = isOpen ? items[activeIndex] : null;

  useEffect(() => {
    if (!isOpen || activeIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onChangeIndex((activeIndex - 1 + items.length) % items.length);
      } else if (e.key === 'ArrowRight') {
        onChangeIndex((activeIndex + 1) % items.length);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, isOpen, items.length, onChangeIndex, onClose]);

  if (!isOpen || activeIndex === null || !activeItem || typeof document === 'undefined') {
    return null;
  }

  const handlePrev = () => onChangeIndex((activeIndex - 1 + items.length) % items.length);
  const handleNext = () => onChangeIndex((activeIndex + 1) % items.length);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#2c1d20]/88 overscroll-contain"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview foto ${stripTextFormatting(activeItem.title)}`}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-20 p-2.5 rounded-full bg-[#FFF9F5]/90 text-[#8F454B] hover:bg-[#FFF9F5] transition-colors"
        aria-label="Tutup lightbox"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="relative w-full max-w-4xl flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full flex items-center justify-center gap-2 sm:gap-4">
          {items.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="shrink-0 p-2.5 sm:p-3 rounded-full bg-[#FFF9F5]/90 text-[#8F454B] hover:bg-[#FFF9F5] transition-colors"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative w-full max-h-[75vh] aspect-[4/5] sm:aspect-[4/3] max-w-2xl overflow-hidden rounded-2xl bg-[#F8E6EB]/20">
            <SmartImage
              src={activeItem.image_url}
              alt={activeItem.alt_text || activeItem.title}
              focusX={activeItem.image_focus_x}
              focusY={activeItem.image_focus_y}
              loading="eager"
              className="w-full h-full object-contain bg-[#24171a]"
            />
          </div>

          {items.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="shrink-0 p-2.5 sm:p-3 rounded-full bg-[#FFF9F5]/90 text-[#8F454B] hover:bg-[#FFF9F5] transition-colors"
              aria-label="Foto berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="text-center text-[#FFF9F5] space-y-1">
          <p className="landing-serif text-xl sm:text-2xl">
            <FormattedText text={activeItem.title} />
          </p>
          <p className="text-xs tracking-wider uppercase opacity-80">
            <FormattedText text={categoryNames[activeItem.category_id] ?? 'Portofolio'} /> ·{' '}
            {activeIndex + 1} / {items.length}
          </p>
        </div>
      </div>
    </div>,
    document.getElementById('landing-modal-root') ?? document.body
  );
}
