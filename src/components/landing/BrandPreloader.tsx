interface BrandPreloaderProps {
  visible: boolean;
  exiting: boolean;
  businessName?: string;
}

/**
 * Layar loading awal (preloader) elegan berbasis logo DaySheet dengan cincin putar
 * bernuansa Soft Blush & transisi tirai naik halus menuju section Hero.
 */
export function BrandPreloader({
  visible,
  exiting,
  businessName = 'NIWAYULIANA',
}: BrandPreloaderProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat website Niwayuliana Makeup Artist"
      className={`brand-preloader fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden ${
        exiting ? 'is-exiting' : ''
      }`}
    >
      {/* Latar Soft Blush + Champagne lembut */}
      <div aria-hidden="true" className="absolute inset-0 backdrop-mesh-hero" />
      <div aria-hidden="true" className="absolute inset-0 backdrop-pattern backdrop-pattern-lace" />

      {/* Pendaran cahaya lembut di belakang logo (tanpa filter blur berat) */}
      <div
        aria-hidden="true"
        className="preloader-aura pointer-events-none absolute w-80 h-80 sm:w-[26rem] sm:h-[26rem] rounded-full"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--color-blush) 92%, #ffffff) 0%, color-mix(in srgb, var(--color-champagne) 30%, transparent) 46%, transparent 72%)',
        }}
      />

      {/* Konten Utama Preloader */}
      <div className="preloader-content relative z-10 flex flex-col items-center text-center px-6">
        {/* Wadah Logo DaySheet + Cincin Orbit Animasi */}
        <div className="relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44">
          {/* Cincin orbit luar (rose-champagne) */}
          <svg
            viewBox="0 0 180 180"
            fill="none"
            aria-hidden="true"
            className="preloader-ring-outer absolute inset-0 w-full h-full"
          >
            <circle
              cx="90"
              cy="90"
              r="84"
              stroke="var(--color-accent)"
              strokeOpacity="0.16"
              strokeWidth="1"
            />
            <path
              d="M90 6 A84 84 0 0 1 174 90"
              stroke="var(--color-accent)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx="174" cy="90" r="2.6" fill="var(--color-accent)" />
          </svg>

          {/* Cincin orbit dalam berlawanan arah (champagne dashed) */}
          <svg
            viewBox="0 0 180 180"
            fill="none"
            aria-hidden="true"
            className="preloader-ring-inner absolute inset-2.5 w-[calc(100%-1.25rem)] h-[calc(100%-1.25rem)]"
          >
            <circle
              cx="90"
              cy="90"
              r="80"
              stroke="var(--color-champagne)"
              strokeOpacity="0.55"
              strokeWidth="1"
              strokeDasharray="4 7"
            />
            <path
              d="M90 170 A80 80 0 0 1 10 90"
              stroke="var(--color-champagne)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Medallion Logo DaySheet dengan kilau diagonal */}
          <div
            className="preloader-logo-badge relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border shadow-[0_18px_42px_-16px_rgba(143,69,75,0.34)] bg-white flex items-center justify-center"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-accent) 26%, transparent)',
            }}
          >
            <img
              src="/daysheet-logo.png"
              alt="DaySheet"
              className="w-full h-full object-contain p-1"
            />
            <span aria-hidden="true" className="preloader-logo-sheen" />
          </div>
        </div>

        {/* Teks Identitas & Bar Progres Halus */}
        <div className="mt-7 space-y-2.5">
          <p
            className="landing-serif text-lg sm:text-xl tracking-[0.22em] uppercase"
            style={{ color: 'var(--color-heading)' }}
          >
            {businessName}
          </p>

          {/* Garis progres shimmer */}
          <div
            aria-hidden="true"
            className="relative mx-auto w-36 sm:w-44 h-[2px] rounded-full overflow-hidden"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
            }}
          >
            <div className="preloader-progress-bar h-full rounded-full" />
          </div>

          <p
            className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-75"
            style={{ color: 'var(--color-accent)' }}
          >
            Powered by DaySheet
          </p>
        </div>
      </div>

      {/* Garis aksen tipis di tepi bawah tirai saat terangkat */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-px backdrop-edge-line opacity-80"
      />
    </div>
  );
}
