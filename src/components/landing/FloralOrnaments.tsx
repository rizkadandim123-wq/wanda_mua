interface OrnamentProps {
  className?: string;
}

/**
 * Ornamen mawar & ranting eukaliptus garis halus di kiri atas hero
 */
export function HeroFloralTopLeft({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 220 220" fill="none" aria-hidden="true" className={className}>
      {/* Batang utama melengkung */}
      <path
        d="M22 192C48 134 92 84 166 40"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
      <path
        d="M66 132C90 128 118 116 144 96"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* Kuntum mawar utama berlapis halus */}
      <path
        d="M166 40C156 24 169 12 182 19C192 9 208 19 199 34C213 41 206 59 189 56C180 68 161 59 166 40Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M174 39C174 30 183 26 189 32C195 38 190 47 181 47C176 47 174 43 174 39Z"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <circle cx="182" cy="38" r="3" stroke="currentColor" strokeWidth="0.75" />

      {/* Daun eukaliptus lembut */}
      <path
        d="M95 103C72 95 62 76 78 66C91 75 97 89 95 103Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M95 103C84 87 82 78 78 66"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeOpacity="0.65"
      />
      <path
        d="M114 82C134 80 148 94 140 109C123 108 112 96 114 82Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M54 146C35 144 26 132 37 120C49 125 56 136 54 146Z"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path
        d="M144 96C151 87 162 88 164 97C158 103 149 102 144 96Z"
        stroke="currentColor"
        strokeWidth="0.75"
      />
    </svg>
  );
}

/**
 * Ornamen bunga garden rose di kanan bawah foto melengkung
 */
export function HeroFloralBottomRight({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 210 210" fill="none" aria-hidden="true" className={className}>
      <path
        d="M180 24C156 84 114 134 44 174"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
      <path
        d="M124 106C106 132 76 150 42 152"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* Bunga mekar sudut kanan bawah */}
      <path
        d="M46 172C31 182 18 168 27 154C15 147 22 128 38 134C44 118 65 123 62 140C76 148 67 169 46 172Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M41 157C36 150 40 142 47 143C54 144 56 153 49 158"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
      />

      {/* Daun & kuncup */}
      <path
        d="M108 124C124 133 134 149 123 160C107 155 100 139 108 124Z"
        stroke="currentColor"
        strokeWidth="0.85"
      />
      <path
        d="M142 82C123 76 116 60 127 51C140 57 145 70 142 82Z"
        stroke="currentColor"
        strokeWidth="0.85"
      />
      <path
        d="M158 54C172 56 181 67 174 78C162 75 156 64 158 54Z"
        stroke="currentColor"
        strokeWidth="0.75"
      />
    </svg>
  );
}

/**
 * Ornamen simetris bergaya undangan bridal untuk bagian Kontak / Tentang
 */
export function BotanicalCrest({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 180 44" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 24H66M114 24H168"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
      {/* Kelopak tengah */}
      <path
        d="M90 6C82 14 82 24 90 30C98 24 98 14 90 6Z"
        stroke="currentColor"
        strokeWidth="0.9"
      />
      <path
        d="M90 30C78 24 72 28 73 35C80 37 87 34 90 30Z"
        stroke="currentColor"
        strokeWidth="0.85"
      />
      <path
        d="M90 30C102 24 108 28 107 35C100 37 93 34 90 30Z"
        stroke="currentColor"
        strokeWidth="0.85"
      />
      <path
        d="M90 30C84 18 76 14 68 18C73 25 81 28 90 30Z"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <path
        d="M90 30C96 18 104 14 112 18C107 25 99 28 90 30Z"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <circle cx="90" cy="35" r="1.5" fill="currentColor" fillOpacity="0.65" />
    </svg>
  );
}

/**
 * Pembatas antarbagian dengan ranting bunga halus
 */
export function BotanicalDivider({ className = '' }: OrnamentProps) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-12 sm:w-24 bg-current opacity-25" />
      <svg viewBox="0 0 64 26" fill="none" className="w-12 h-6 opacity-70">
        <path
          d="M4 14H60"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />
        <path
          d="M32 14C27 8 28 3 32 2C36 3 37 8 32 14Z"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <path
          d="M32 14C24 12 19 16 20 20C24 21 29 18 32 14Z"
          stroke="currentColor"
          strokeWidth="0.85"
        />
        <path
          d="M32 14C40 12 45 16 44 20C40 21 35 18 32 14Z"
          stroke="currentColor"
          strokeWidth="0.85"
        />
        <circle cx="32" cy="14" r="1.5" fill="currentColor" fillOpacity="0.6" />
      </svg>
      <span className="h-px w-12 sm:w-24 bg-current opacity-25" />
    </div>
  );
}
