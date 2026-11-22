import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { registerPhotoParallax, registerSectionStage } from '../../lib/scrollChoreography';
import { LiquidGlassAccent } from '../landing/LiquidGlassAccent';
import { FormattedTitle } from './FormattedTitle';

const SectionStageContext = createContext<boolean>(true);

/**
 * Mengembalikan true saat konten section sudah siap tampil
 * (langsung true jika tanpa bubbleTransition, atau tepat saat gelembung transisi pecah).
 */
export function useSectionRevealed(): boolean {
  return useContext(SectionStageContext);
}

interface ScrollStageProps {
  children: ReactNode;
  className?: string;
  /**
   * Aktifkan transisi gelembung kaca cair antarsection:
   * gelembung meluncur masuk dari batas section sebelumnya -> diam di tempat ->
   * meletus menyebar ke segala arah -> konten section muncul halus.
   */
  bubbleTransition?: boolean;
  /** Sisi lengkung gerak gelembung agar terasa mengalir organik antarsection */
  bubbleSide?: 'left' | 'right';
}

const SECTION_POP_REVEAL_MS = 490;

/**
 * Membungkus isi section agar memiliki pergeseran & transisi opacity halus saat keluar/masuk
 * viewport mengikuti arah scroll, plus opsi transisi gelembung kaca cair pecah sebelum konten muncul.
 */
export function ScrollStage({
  children,
  className = '',
  bubbleTransition = false,
  bubbleSide = 'left',
}: ScrollStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [fromEdge, setFromEdge] = useState<'top' | 'bottom'>('top');
  const [contentRevealed, setContentRevealed] = useState(() => {
    if (!bubbleTransition) return true;
    if (typeof window === 'undefined') return true;
    if (typeof IntersectionObserver === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const armedRef = useRef(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    return registerSectionStage(el);
  }, []);

  useEffect(() => {
    if (!bubbleTransition) {
      setContentRevealed(true);
      return;
    }
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setContentRevealed(true);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setContentRevealed(true);
      return;
    }

    const el = stageRef.current;
    if (!el) return;

    const clearPendingTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (armedRef.current) {
              armedRef.current = false;
              const edge: 'top' | 'bottom' = entry.boundingClientRect.top < 0 ? 'bottom' : 'top';
              setFromEdge(edge);
              setContentRevealed(false);
              setBurstKey((k) => k + 1);

              clearPendingTimer();
              timerRef.current = window.setTimeout(() => {
                timerRef.current = null;
                setContentRevealed(true);
              }, SECTION_POP_REVEAL_MS);
            }
          } else {
            const rect = entry.boundingClientRect;
            const vh = window.innerHeight || 800;
            // Re-arm lembut hanya saat section benar-benar keluar jauh dari viewport
            // agar saat pengguna scroll ke section lain lalu kembali, gelembung pecah lagi dengan mulus
            if (rect.top > vh + 110 || rect.bottom < -110) {
              clearPendingTimer();
              armedRef.current = true;
              setContentRevealed(false);
            }
          }
        }
      },
      {
        threshold: 0.04,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(el);
    return () => {
      clearPendingTimer();
      observer.disconnect();
    };
  }, [bubbleTransition]);

  if (!bubbleTransition) {
    return (
      <SectionStageContext.Provider value={true}>
        <div ref={stageRef} className={`scroll-stage ${className}`}>
          {children}
        </div>
      </SectionStageContext.Provider>
    );
  }

  return (
    <SectionStageContext.Provider value={contentRevealed}>
      <LiquidGlassAccent
        mode="section-travel"
        triggerCount={burstKey}
        fromEdge={fromEdge}
        driftSide={bubbleSide}
        className="z-30"
      />
      <div ref={stageRef} className={`scroll-stage ${className}`}>
        <div
          className={`section-bubble-content ${
            contentRevealed
              ? 'is-revealed'
              : fromEdge === 'bottom'
                ? 'from-top'
                : 'from-bottom'
          }`}
        >
          {children}
        </div>
      </div>
    </SectionStageContext.Provider>
  );
}

interface PhotoMaskRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  eager?: boolean;
  parallax?: number;
  breathe?: boolean;
}

/**
 * Menyajikan foto editorial dengan animasi mask reveal (tirai halus),
 * parallax tipis saat scroll, serta slow-zoom hampir tak terasa.
 * Tersinkronisasi dengan momen pecahnya gelembung section jika berada di dalam ScrollStage.
 */
export function PhotoMaskReveal({
  children,
  className = '',
  delay = 0,
  eager = false,
  parallax = 10,
  breathe = true,
}: PhotoMaskRevealProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const stageRevealed = useSectionRevealed();

  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');
  const [fromTop, setFromTop] = useState(false);

  useEffect(() => {
    if (eager) {
      let id2 = 0;
      const id1 = window.requestAnimationFrame(() => {
        id2 = window.requestAnimationFrame(() => setInView(true));
      });
      return () => {
        window.cancelAnimationFrame(id1);
        if (id2) window.cancelAnimationFrame(id2);
      };
    }

    const el = outerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
          } else {
            const rect = entry.boundingClientRect;
            const vh = window.innerHeight || 800;
            if (rect.top > vh + 140) {
              setFromTop(false);
              setInView(false);
            } else if (rect.bottom < -140) {
              setFromTop(true);
              setInView(false);
            }
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -24px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  useEffect(() => {
    if (!parallax) return;
    const target = parallaxRef.current;
    if (!target) return;
    return registerPhotoParallax(target, parallax);
  }, [parallax]);

  const revealed = inView && stageRevealed;

  return (
    <div
      ref={outerRef}
      className={`photo-mask-reveal ${
        revealed ? 'is-revealed' : fromTop ? 'from-top' : 'from-bottom'
      } ${className}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      <div
        ref={parallaxRef}
        className={`w-full h-full photo-parallax-inner ${breathe ? 'editorial-photo-breathe' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}

interface LineRevealTitleProps {
  text: string;
  baseDelay?: number;
  eager?: boolean;
  /** Jika diberikan, mengontrol kapan animasi reveal dimulai (misalnya menunggu preloader selesai) */
  active?: boolean;
  className?: string;
}

/**
 * Memunculkan judul editorial bertahap per baris/frasa melalui mask reveal yang bersih
 * sambil mempertahankan penekanan *miring* dari FormattedTitle.
 */
export function LineRevealTitle({
  text,
  baseDelay = 0,
  eager = false,
  active,
  className = '',
}: LineRevealTitleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const stageRevealed = useSectionRevealed();
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');
  const [fromTop, setFromTop] = useState(false);

  const lines = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return [];
    const explicit = trimmed
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (explicit.length > 1) return explicit;

    // Pecah halus menjadi 2 baris editorial tanpa memutus frasa *italic*, #bold#, atau $coret$ di tengah
    const tokens = trimmed.match(/\*[^*]+\*|#[^#]+#|\$[^$]+\$|\S+/g) ?? [trimmed];
    if (tokens.length <= 3) return [trimmed];
    const splitAt = Math.ceil(tokens.length / 2);
    return [tokens.slice(0, splitAt).join(' '), tokens.slice(splitAt).join(' ')];
  }, [text]);

  useEffect(() => {
    if (typeof active === 'boolean') {
      if (!active) {
        setInView(false);
        return;
      }
      let id2 = 0;
      const id1 = window.requestAnimationFrame(() => {
        id2 = window.requestAnimationFrame(() => setInView(true));
      });
      return () => {
        window.cancelAnimationFrame(id1);
        if (id2) window.cancelAnimationFrame(id2);
      };
    }

    if (eager) {
      let id2 = 0;
      const id1 = window.requestAnimationFrame(() => {
        id2 = window.requestAnimationFrame(() => setInView(true));
      });
      return () => {
        window.cancelAnimationFrame(id1);
        if (id2) window.cancelAnimationFrame(id2);
      };
    }

    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
          } else {
            const rect = entry.boundingClientRect;
            const vh = window.innerHeight || 800;
            if (rect.top > vh + 140) {
              setFromTop(false);
              setInView(false);
            } else if (rect.bottom < -140) {
              setFromTop(true);
              setInView(false);
            }
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [active, eager]);

  const visible = typeof active === 'boolean' ? inView : inView && stageRevealed;

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {lines.map((line, idx) => (
        <span key={idx} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span
            className={`line-reveal-item block ${
              visible ? 'is-visible' : fromTop ? 'from-top' : 'from-bottom'
            }`}
            style={{ transitionDelay: `${baseDelay + idx * 85}ms` }}
          >
            <FormattedTitle text={line} />
          </span>
        </span>
      ))}
    </span>
  );
}
