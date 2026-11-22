import type { CSSProperties } from 'react';

type BackdropVariant = 'hero' | 'rose' | 'champagne' | 'ivory' | 'footer';
type BackdropPattern = 'lace' | 'dots' | 'damask' | 'none';

interface SectionBackdropProps {
  variant?: BackdropVariant;
  pattern?: BackdropPattern;
  petals?: boolean;
  sheen?: boolean;
  edge?: boolean;
}

interface PetalSpec {
  left: string;
  top: string;
  size: number;
  tone: 'accent' | 'champagne';
  rotate: number;
}

const PETALS: PetalSpec[] = [
  { left: '5%', top: '14%', size: 18, tone: 'accent', rotate: -24 },
  { left: '18%', top: '72%', size: 14, tone: 'champagne', rotate: 36 },
  { left: '34%', top: '8%', size: 12, tone: 'accent', rotate: 12 },
  { left: '52%', top: '88%', size: 16, tone: 'champagne', rotate: -48 },
  { left: '67%', top: '20%', size: 13, tone: 'accent', rotate: 64 },
  { left: '82%', top: '62%', size: 19, tone: 'accent', rotate: -12 },
  { left: '93%', top: '30%', size: 12, tone: 'champagne', rotate: 28 },
  { left: '44%', top: '46%', size: 10, tone: 'champagne', rotate: -70 },
];

/**
 * Lapisan latar estetik ringan (terisolasi contain: strict, tanpa nested mask-image)
 * agar scroll tetap mulus 60fps sambil menjaga nuansa Soft Blush & Champagne.
 */
export function SectionBackdrop({
  variant = 'rose',
  pattern = 'none',
  petals = false,
  sheen = false,
  edge = true,
}: SectionBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className="backdrop-isolated pointer-events-none select-none absolute inset-0 overflow-hidden"
    >
      <div className={`absolute inset-0 backdrop-mesh-${variant}`} />

      {pattern !== 'none' && (
        <div className={`absolute inset-0 backdrop-pattern backdrop-pattern-${pattern}`} />
      )}

      {sheen && <div className="absolute inset-0 backdrop-sheen" />}

      {edge && <div className="absolute top-0 inset-x-0 h-px backdrop-edge-line" />}

      {petals && (
        <div className="hidden sm:block absolute inset-0">
          {PETALS.map((petal, idx) => (
            <svg
              key={idx}
              viewBox="0 0 24 32"
              fill="none"
              className="absolute animate-petal"
              style={
                {
                  left: petal.left,
                  top: petal.top,
                  width: petal.size,
                  color:
                    petal.tone === 'accent' ? 'var(--color-accent)' : 'var(--color-champagne)',
                  '--petal-rotate': `${petal.rotate}deg`,
                } as CSSProperties
              }
            >
              <path
                d="M12 1C19 8 22 17 18 25C15.5 30 8.5 30 6 25C2 17 5 8 12 1Z"
                fill="currentColor"
                fillOpacity="0.28"
                stroke="currentColor"
                strokeOpacity="0.46"
                strokeWidth="0.8"
              />
              <path
                d="M12 5C12.5 13 12.5 20 11 28"
                stroke="currentColor"
                strokeOpacity="0.38"
                strokeWidth="0.6"
                strokeLinecap="round"
              />
            </svg>
          ))}
        </div>
      )}
    </div>
  );
}
