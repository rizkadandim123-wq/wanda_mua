interface OrnamentProps {
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

function quadPoint(p0: Point, c: Point, p2: Point, t: number): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * c.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * c.y + t * t * p2.y,
  };
}

function buildPearls(p0: Point, c: Point, p2: Point, count: number, big: number, small: number) {
  const pearls: Array<Point & { r: number }> = [];
  for (let i = 0; i <= count; i += 1) {
    const pt = quadPoint(p0, c, p2, i / count);
    pearls.push({ ...pt, r: i % 2 === 0 ? big : small });
  }
  return pearls;
}

const OUTER_PEARLS = buildPearls({ x: 8, y: 8 }, { x: 160, y: 116 }, { x: 312, y: 8 }, 24, 3.4, 2.3);
const INNER_PEARLS = buildPearls({ x: 52, y: 8 }, { x: 160, y: 74 }, { x: 268, y: 8 }, 16, 2.4, 1.7);

/**
 * Untaian mutiara menjuntai bergaya dekorasi pengantin
 */
export function PearlGarland({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 320 140" fill="none" aria-hidden="true" className={className}>
      <path d="M8 8Q160 116 312 8" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.55" />
      <path d="M52 8Q160 74 268 8" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.45" />

      {OUTER_PEARLS.map((p, i) => (
        <g key={`o-${i}`}>
          <circle
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="0.85"
          />
          <circle cx={p.x - p.r * 0.35} cy={p.y - p.r * 0.35} r={p.r * 0.3} fill="#FFFFFF" fillOpacity="0.8" />
        </g>
      ))}

      {INNER_PEARLS.map((p, i) => (
        <g key={`i-${i}`}>
          <circle
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="currentColor"
            fillOpacity="0.18"
            stroke="currentColor"
            strokeWidth="0.75"
          />
          <circle cx={p.x - p.r * 0.35} cy={p.y - p.r * 0.35} r={p.r * 0.3} fill="#FFFFFF" fillOpacity="0.75" />
        </g>
      ))}

      {/* Liontin mutiara tetes di tengah */}
      <path d="M160 62V96" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.55" />
      <path
        d="M160 96C165 103 166 110 160 116C154 110 155 103 160 96Z"
        fill="currentColor"
        fillOpacity="0.24"
        stroke="currentColor"
        strokeWidth="0.9"
      />
      <circle cx="158" cy="106" r="1.3" fill="#FFFFFF" fillOpacity="0.8" />

      {/* Simpul pita di kedua ujung */}
      <g stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round">
        <path d="M8 8C2 2 -2 10 4 12C7 13 8 10 8 8Z" fill="currentColor" fillOpacity="0.16" />
        <path d="M8 8C14 2 18 10 12 12C9 13 8 10 8 8Z" fill="currentColor" fillOpacity="0.16" />
        <path d="M312 8C306 2 302 10 308 12C311 13 312 10 312 8Z" fill="currentColor" fillOpacity="0.16" />
        <path d="M312 8C318 2 322 10 316 12C313 13 312 10 312 8Z" fill="currentColor" fillOpacity="0.16" />
      </g>
    </svg>
  );
}

/**
 * Filigree / renda sudut bergaya undangan klasik (posisi default: sudut kiri atas,
 * gunakan rotate-90 / rotate-180 / -rotate-90 untuk sudut lainnya)
 */
export function CornerFlourish({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 160 160" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Garis bingkai sudut ganda */}
        <path d="M6 154V62C6 31 31 6 62 6H154" strokeWidth="0.9" strokeOpacity="0.6" />
        <path d="M18 154V72C18 42 42 18 72 18H154" strokeWidth="0.75" strokeOpacity="0.5" strokeDasharray="2 4" />

        {/* Ukiran gulungan filigree */}
        <path d="M62 6C62 26 48 40 28 40C16 40 9 32 13 24C17 16 29 18 29 28" strokeWidth="1" />
        <path d="M6 62C26 62 40 48 40 28" strokeWidth="0.9" strokeOpacity="0.7" />

        {/* Rosette mungil di sudut */}
        <circle cx="34" cy="34" r="5.5" strokeWidth="0.9" fill="currentColor" fillOpacity="0.12" />
        <circle cx="34" cy="34" r="1.6" fill="currentColor" fillOpacity="0.5" stroke="none" />

        {/* Daun memanjang di kedua sisi */}
        <path d="M6 104C17 96 23 85 21 72C10 79 4 91 6 104Z" strokeWidth="0.9" fill="currentColor" fillOpacity="0.12" />
        <path d="M104 6C96 17 85 23 72 21C79 10 91 4 104 6Z" strokeWidth="0.9" fill="currentColor" fillOpacity="0.12" />
        <path d="M6 104C11 92 15 82 21 72" strokeWidth="0.6" strokeOpacity="0.55" />
        <path d="M104 6C92 11 82 15 72 21" strokeWidth="0.6" strokeOpacity="0.55" />
      </g>

      {/* Titik mutiara kecil */}
      <circle cx="6" cy="128" r="2" fill="currentColor" fillOpacity="0.5" />
      <circle cx="128" cy="6" r="2" fill="currentColor" fillOpacity="0.5" />
      <circle cx="6" cy="142" r="1.3" fill="currentColor" fillOpacity="0.4" />
      <circle cx="142" cy="6" r="1.3" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}
