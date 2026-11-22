import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';

interface LiquidGlassAccentProps {
  /**
   * 'hero': gelembung muncul di tempat & meletus sebelum konten Hero masuk;
   * 'section-travel' (atau alias 'transition'): gelembung berjalan masuk dari batas section
   * sebelumnya, berhenti diam di tempat, mengembang lalu meletus dengan pecahan menyebar ke segala arah.
   */
  mode?: 'hero' | 'section-travel' | 'transition';
  /** Arah datang gelembung untuk mode section-travel ('top' saat scroll ke bawah, 'bottom' saat scroll naik) */
  fromEdge?: 'top' | 'bottom';
  /** Sisi lengkung gerak gelembung agar perpindahan antarsection terasa organik */
  driftSide?: 'left' | 'right';
  /** Counter pemicu eksternal untuk memutar ulang animasi gelembung saat section masuk viewport */
  triggerCount?: number;
  /** Dipertahankan agar pemanggilan lama tetap kompatibel */
  direction?: 'left-to-right' | 'right-to-left';
  /** Menunda animasi awal mode 'hero' sampai preloader selesai terangkat */
  ready?: boolean;
  /** Dipanggil tepat pada momen gelembung meletus */
  onPop?: () => void;
  className?: string;
}

interface BurstShard {
  angle: number;
  distance: number;
  size: number;
  delayMs: number;
  durationMs: number;
  variant: 'orb' | 'bead' | 'sparkle';
}

/**
 * 12 pecahan gelembung kaca cair ringan GPU-composited (mini-bubble glossy, tetes halus, & kilau)
 * yang menyebar luas 360° ke segala arah tepat saat gelembung utama pecah tanpa memberatkan frame rate.
 */
const WIDE_BURST_SHARDS: BurstShard[] = [
  { angle: -166, distance: 255, size: 17, delayMs: 0, durationMs: 700, variant: 'orb' },
  { angle: -134, distance: 205, size: 12, delayMs: 22, durationMs: 630, variant: 'sparkle' },
  { angle: -102, distance: 175, size: 14, delayMs: 30, durationMs: 650, variant: 'orb' },
  { angle: -66, distance: 245, size: 9, delayMs: 14, durationMs: 670, variant: 'bead' },
  { angle: -34, distance: 280, size: 19, delayMs: 6, durationMs: 720, variant: 'orb' },
  { angle: -4, distance: 295, size: 13, delayMs: 18, durationMs: 690, variant: 'sparkle' },
  { angle: 24, distance: 240, size: 16, delayMs: 10, durationMs: 700, variant: 'orb' },
  { angle: 56, distance: 195, size: 10, delayMs: 26, durationMs: 630, variant: 'bead' },
  { angle: 92, distance: 225, size: 15, delayMs: 14, durationMs: 680, variant: 'orb' },
  { angle: 126, distance: 260, size: 12, delayMs: 20, durationMs: 660, variant: 'sparkle' },
  { angle: 154, distance: 270, size: 18, delayMs: 8, durationMs: 710, variant: 'orb' },
  { angle: 178, distance: 215, size: 9, delayMs: 28, durationMs: 620, variant: 'bead' },
];

const HERO_POP_TRIGGER_MS = 480;
const TRAVEL_POP_DELAY_MS = 510;

/**
 * Gelembung kaca cair (liquid glass):
 * - Mode 'hero': muncul diam di tempat -> mengembang -> pecah menyebar sebelum konten Hero masuk.
 * - Mode 'section-travel': meluncur masuk dari section sebelumnya -> berhenti diam di tempat ->
 *   mengembang -> pecah dengan riak kaca & 18 pecahan gelembung menyebar luas ke segala arah.
 */
export function LiquidGlassAccent({
  mode = 'section-travel',
  fromEdge = 'top',
  driftSide = 'left',
  triggerCount,
  ready = true,
  onPop,
  className = '',
}: LiquidGlassAccentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, '');
  const [internalPlayCount, setInternalPlayCount] = useState(0);
  const [isCompactViewport, setIsCompactViewport] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 640
  );
  const onPopRef = useRef(onPop);
  onPopRef.current = onPop;

  const isHero = mode === 'hero';
  const isControlled = typeof triggerCount === 'number';
  const playCount = isControlled ? triggerCount : internalPlayCount;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsCompactViewport(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      if (ready && isHero) onPopRef.current?.();
      return;
    }
    if (!ready || isControlled) return;

    if (isHero) {
      setInternalPlayCount((c) => c + 1);
      const popTimer = window.setTimeout(() => {
        onPopRef.current?.();
      }, HERO_POP_TRIGGER_MS);
      return () => {
        window.clearTimeout(popTimer);
      };
    }
  }, [isControlled, isHero, ready]);

  const distanceScale = isHero
    ? isCompactViewport
      ? 0.56
      : 0.82
    : isCompactViewport
      ? 0.58
      : 1;

  const orbAnimationClass = isHero
    ? 'liquid-pop-orb'
    : `liquid-travel-orb liquid-travel-from-${fromEdge}-${driftSide}`;

  const burstBaseDelayMs = isHero ? 470 : TRAVEL_POP_DELAY_MS;
  const ringDelayMs = isHero ? 460 : TRAVEL_POP_DELAY_MS - 10;
  const ringEchoDelayMs = isHero ? 520 : TRAVEL_POP_DELAY_MS + 55;

  const placementClass = isHero
    ? 'inset-0 items-center justify-center'
    : fromEdge === 'bottom'
      ? 'inset-x-0 bottom-8 sm:bottom-14 h-[290px] sm:h-[340px] items-center justify-center'
      : 'inset-x-0 top-8 sm:top-14 h-[290px] sm:h-[340px] items-center justify-center';

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none select-none absolute overflow-visible flex ${placementClass} ${className}`}
    >
      {playCount > 0 && (
        <div
          key={playCount}
          className={`liquid-pop-stage relative flex items-center justify-center ${
            isHero ? 'w-44 h-44 sm:w-56 sm:h-56' : 'w-36 h-36 sm:w-48 sm:h-48'
          }`}
        >
          {/* Gelembung kaca cair utama */}
          <div className={`${orbAnimationClass} absolute inset-0`}>
            <svg
              viewBox="0 0 220 220"
              fill="none"
              className="w-full h-full overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id={`lp-rim-${uid}`} cx="30%" cy="24%" r="72%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
                  <stop offset="35%" stopColor="#FFF9F5" stopOpacity="0.24" />
                  <stop offset="76%" stopColor="#F8E6EB" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#C9A27E" stopOpacity="0.42" />
                </radialGradient>
                <linearGradient id={`lp-arc-${uid}`} x1="15%" y1="12%" x2="82%" y2="88%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
                  <stop offset="45%" stopColor="#FFF9F5" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#B96B78" stopOpacity="0.38" />
                </linearGradient>
              </defs>

              {/* Sorotan cahaya sabit kiri atas */}
              <path
                d="M50 74C65 42 102 26 140 34"
                stroke={`url(#lp-arc-${uid})`}
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M66 56C82 41 104 35 125 38"
                stroke="#FFFFFF"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.82"
              />
              {/* Bias cahaya hangat kanan bawah */}
              <path
                d="M174 134C164 166 134 186 98 184"
                stroke={`url(#lp-rim-${uid})`}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.84"
              />
              <circle cx="72" cy="60" r="3.8" fill="#FFFFFF" fillOpacity="0.88" />
            </svg>
          </div>

          {/* Cincin riak letusan kaca (utama + gema halus) */}
          <span
            className="liquid-pop-ring absolute inset-0 rounded-full"
            style={{ animationDelay: `${ringDelayMs}ms` }}
          />
          <span
            className="liquid-pop-ring-echo absolute inset-2 rounded-full"
            style={{ animationDelay: `${ringEchoDelayMs}ms` }}
          />

          {/* Pecahan gelembung kaca cair menyebar luas ke segala arah */}
          {WIDE_BURST_SHARDS.map((shard, idx) => {
            const rad = (shard.angle * Math.PI) / 180;
            const dist = Math.round(shard.distance * distanceScale);
            const tx = Math.round(Math.cos(rad) * dist);
            const ty = Math.round(Math.sin(rad) * dist);
            const variantClass =
              shard.variant === 'orb'
                ? 'liquid-burst-orb rounded-full'
                : shard.variant === 'sparkle'
                  ? 'liquid-pop-sparkle'
                  : 'liquid-pop-droplet rounded-full';

            return (
              <span
                key={idx}
                className={`liquid-shard-fly absolute ${variantClass}`}
                style={
                  {
                    width: `${shard.size}px`,
                    height: `${shard.size}px`,
                    '--pop-tx': `${tx}px`,
                    '--pop-ty': `${ty}px`,
                    animationDelay: `${burstBaseDelayMs + shard.delayMs}ms`,
                    animationDuration: `${shard.durationMs}ms`,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
