interface OrnamentProps {
  className?: string;
}

/**
 * Buket dua kuas makeup (powder blush brush + blending brush) dengan ranting daun halus & kilau
 */
export function MakeupBrushBouquetOrnament({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 220 220" fill="none" aria-hidden="true" className={className}>
      {/* Halo cat air blush lembut di belakang */}
      <circle cx="112" cy="112" r="68" fill="currentColor" fillOpacity="0.09" />
      <circle cx="132" cy="92" r="42" fill="currentColor" fillOpacity="0.07" />

      {/* Lingkaran garis bingkai tipis terbuka */}
      <path
        d="M52 146C34 114 40 72 68 50C98 26 142 30 166 58"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />
      <path
        d="M174 84C184 116 172 154 142 174C116 190 82 186 62 166"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeOpacity="0.4"
        strokeDasharray="3 4"
        strokeLinecap="round"
      />

      {/* Kuas 1: Powder / Blush Brush miring diagonal kanan atas */}
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* Gagang ramping meruncing */}
        <path
          d="M56 178L128 106L136 114L62 184C58.5 186.5 53.5 181.5 56 178Z"
          fill="currentColor"
          fillOpacity="0.14"
          strokeWidth="1.2"
        />
        {/* Leher ferrule logam */}
        <path
          d="M128 106L146 88L156 98L138 116Z"
          fill="currentColor"
          fillOpacity="0.06"
          strokeWidth="1.2"
        />
        <path d="M132 102L142 112" strokeWidth="1" />
        <path d="M142 92L152 102" strokeWidth="0.9" strokeOpacity="0.65" />
        {/* Kepala bulu kuas melengkung lembut */}
        <path
          d="M146 88C150 68 164 56 177 60C188 64 190 80 178 92C168 102 158 100 156 98Z"
          fill="currentColor"
          fillOpacity="0.16"
          strokeWidth="1.25"
        />
        {/* Garis helai bulu halus */}
        <path d="M155 86C161 76 168 69 177 65" strokeWidth="0.85" strokeOpacity="0.65" />
        <path d="M158 91C165 82 172 76 180 73" strokeWidth="0.85" strokeOpacity="0.65" />
        <path d="M152 80C157 71 163 65 170 61" strokeWidth="0.85" strokeOpacity="0.55" />
      </g>

      {/* Kuas 2: Eyeshadow Blending Brush menyilang halus */}
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M84 54L154 174C155.5 176.5 159.5 174 158 171L89 50Z"
          fill="currentColor"
          fillOpacity="0.11"
          strokeWidth="1.15"
        />
        <path
          d="M78 44L84 54L89 50L83 40Z"
          fill="currentColor"
          fillOpacity="0.06"
          strokeWidth="1.1"
        />
        <path
          d="M78 44C70 36 69 27 74 24C79 21 86 28 83 40Z"
          fill="currentColor"
          fillOpacity="0.15"
          strokeWidth="1.15"
        />
        <path d="M79 38C76 32 75 28 76 25" strokeWidth="0.75" strokeOpacity="0.6" />
      </g>

      {/* Tangkai daun botani kecil melingkari pangkal kuas */}
      <g stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round">
        <path d="M74 154C88 134 106 122 126 116" strokeOpacity="0.75" />
        <path
          d="M87 137C81 127 83 118 90 116C94 123 93 132 87 137Z"
          fill="currentColor"
          fillOpacity="0.14"
        />
        <path
          d="M104 126C106 115 113 110 119 112C119 119 112 125 104 126Z"
          fill="currentColor"
          fillOpacity="0.14"
        />
        <path
          d="M95 142C104 139 112 142 114 148C107 151 99 148 95 142Z"
          fill="currentColor"
          fillOpacity="0.12"
        />
      </g>

      {/* 3 Kilau bintang makeup empat sudut */}
      <path
        d="M44 62L46.5 69.5L54 72L46.5 74.5L44 82L41.5 74.5L34 72L41.5 69.5Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      <path
        d="M180 128L182 133L187 135L182 137L180 142L178 137L173 135L178 133Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M114 30L115.5 34.5L120 36L115.5 37.5L114 42L112.5 37.5L108 36L112.5 34.5Z"
        fill="currentColor"
        fillOpacity="0.45"
      />
    </svg>
  );
}

/**
 * Ilustrasi lipstik satin miring dengan goresan cream blush lembut & kilau
 */
export function MakeupLipstickOrnament({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 180 220" fill="none" aria-hidden="true" className={className}>
      {/* Halo oval cat air blush */}
      <ellipse cx="92" cy="112" rx="58" ry="68" fill="currentColor" fillOpacity="0.09" />

      {/* Goresan swatch cream blush / lip cream di belakang */}
      <path
        d="M36 144C54 130 72 136 96 154C116 168 134 168 148 154"
        stroke="currentColor"
        strokeWidth="9"
        strokeOpacity="0.11"
        strokeLinecap="round"
      />

      {/* Lipstik miring elegan */}
      <g
        transform="rotate(-16 90 112)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Tabung bawah */}
        <rect
          x="68"
          y="108"
          width="44"
          height="66"
          rx="5"
          fill="currentColor"
          fillOpacity="0.14"
        />
        <line x1="75" y1="118" x2="75" y2="164" strokeWidth="0.9" strokeOpacity="0.5" />

        {/* Ring tengah bermahkota tipis */}
        <rect
          x="72"
          y="88"
          width="36"
          height="20"
          rx="2.5"
          fill="currentColor"
          fillOpacity="0.06"
        />
        <line x1="72" y1="95" x2="108" y2="95" strokeWidth="0.85" strokeOpacity="0.65" />
        <line x1="72" y1="102" x2="108" y2="102" strokeWidth="0.85" strokeOpacity="0.65" />

        {/* Peluru lipstik miring satin */}
        <path
          d="M77 88V58C77 50 86 38 99 36C102 36 103 40 103 46V88Z"
          fill="currentColor"
          fillOpacity="0.18"
        />
        {/* Sisi pantulan highlight */}
        <path
          d="M84 56C89 48 95 44 100 42"
          strokeWidth="0.95"
          strokeOpacity="0.7"
        />
        <path d="M84 82V66" strokeWidth="0.85" strokeOpacity="0.5" />
      </g>

      {/* 3 Bintang kilau satin */}
      <path
        d="M42 64L44.5 71L52 73.5L44.5 76L42 83L39.5 76L32 73.5L39.5 71Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      <path
        d="M140 82L142 87L147 89L142 91L140 96L138 91L133 89L138 87Z"
        fill="currentColor"
        fillOpacity="0.48"
      />
      <path
        d="M132 164L133.5 168L137.5 169.5L133.5 171L132 175L130.5 171L126.5 169.5L130.5 168Z"
        fill="currentColor"
        fillOpacity="0.45"
      />
    </svg>
  );
}

/**
 * Bedak padat / blush compact terbuka dengan cermin kaca & kilau
 */
export function PowderCompactOrnament({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" className={className}>
      {/* Halo cat air blush */}
      <circle cx="100" cy="108" r="68" fill="currentColor" fillOpacity="0.08" />

      <g
        transform="rotate(-12 100 108)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Engsel pemisah antara tutup cermin dan pan bedak */}
        <rect x="86" y="96" width="28" height="7" rx="3.5" fill="currentColor" fillOpacity="0.14" />

        {/* Tutup cermin atas */}
        <circle cx="100" cy="60" r="37" fill="currentColor" fillOpacity="0.06" />
        <circle cx="100" cy="60" r="30.5" strokeWidth="0.95" strokeOpacity="0.7" />
        {/* Garis pantulan kaca cermin */}
        <line x1="82" y1="70" x2="108" y2="44" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="92" y1="74" x2="115" y2="51" strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="100" cy="23" r="2.2" fill="currentColor" fillOpacity="0.55" />

        {/* Wadah pan bedak bawah */}
        <circle cx="100" cy="140" r="39" fill="currentColor" fillOpacity="0.09" />
        <circle cx="100" cy="140" r="31.5" fill="currentColor" fillOpacity="0.15" strokeWidth="1" />
        <circle
          cx="100"
          cy="140"
          r="24"
          strokeWidth="0.75"
          strokeDasharray="2.5 3"
          strokeOpacity="0.6"
        />
        {/* Klip pembuka di bawah */}
        <rect x="93" y="178" width="14" height="4" rx="2" fill="currentColor" fillOpacity="0.3" />
      </g>

      {/* Butiran shimmer & kilau */}
      <path
        d="M154 64L156 70L162 72L156 74L154 80L152 74L146 72L152 70Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      <path
        d="M42 132L44 137L49 139L44 141L42 146L40 141L35 139L40 137Z"
        fill="currentColor"
        fillOpacity="0.45"
      />
      <circle cx="160" cy="128" r="1.6" fill="currentColor" fillOpacity="0.45" />
      <circle cx="48" cy="54" r="1.4" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

/**
 * Botol mist / parfum kristal bergaya atelier dengan pita halus & embun tipis
 */
export function PerfumeBottleOrnament({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 180 220" fill="none" aria-hidden="true" className={className}>
      <circle cx="90" cy="122" r="60" fill="currentColor" fillOpacity="0.09" />

      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Tutup botol faset */}
        <path
          d="M78 40H102L106 56H74L78 40Z"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <line x1="84" y1="40" x2="82" y2="56" strokeWidth="0.85" strokeOpacity="0.6" />
        <line x1="96" y1="40" x2="98" y2="56" strokeWidth="0.85" strokeOpacity="0.6" />

        {/* Leher spray & pita satin tipis */}
        <rect x="81" y="56" width="18" height="14" rx="2" fill="currentColor" fillOpacity="0.08" />
        <path
          d="M81 66C68 58 61 66 68 74C74 79 80 72 81 66Z"
          fill="currentColor"
          fillOpacity="0.12"
          strokeWidth="1"
        />
        <path
          d="M99 66C112 58 119 66 112 74C106 79 100 72 99 66Z"
          fill="currentColor"
          fillOpacity="0.12"
          strokeWidth="1"
        />
        <path d="M84 70L74 90M96 70L106 90" strokeWidth="0.9" strokeOpacity="0.65" />

        {/* Badan botol kaca melengkung */}
        <path
          d="M52 94C52 80 65 70 81 70H99C115 70 128 80 128 94V162C128 172 120 180 110 180H70C60 180 52 172 52 162V94Z"
          fill="currentColor"
          fillOpacity="0.06"
        />
        {/* Isi cairan parfum blush di dalam */}
        <path
          d="M57 112C72 108 106 116 123 110V161C123 169 117 175 109 175H71C63 175 57 169 57 161V112Z"
          fill="currentColor"
          fillOpacity="0.14"
          strokeWidth="0.8"
          strokeOpacity="0.45"
        />
        {/* Bingkai label minimalis */}
        <rect
          x="67"
          y="108"
          width="46"
          height="50"
          rx="6"
          fill="#FFF9F5"
          fillOpacity="0.45"
          strokeWidth="0.95"
        />
        <line x1="77" y1="126" x2="103" y2="126" strokeWidth="0.8" strokeOpacity="0.65" />
        <line x1="82" y1="136" x2="98" y2="136" strokeWidth="0.8" strokeOpacity="0.5" />
      </g>

      {/* Titik semprotan mist & kilau bintang */}
      <circle cx="136" cy="54" r="1.5" fill="currentColor" fillOpacity="0.45" />
      <circle cx="146" cy="48" r="1.1" fill="currentColor" fillOpacity="0.4" />
      <circle cx="144" cy="60" r="1" fill="currentColor" fillOpacity="0.35" />
      <path
        d="M36 86L38 91L43 93L38 95L36 100L34 95L29 93L34 91Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      <path
        d="M144 148L145.5 152.5L150 154L145.5 155.5L144 160L142.5 155.5L138 154L142.5 152.5Z"
        fill="currentColor"
        fillOpacity="0.45"
      />
    </svg>
  );
}

/**
 * Palet eyeshadow & blush terbuka miring dengan 6 pan warna + kuas kecil
 */
export function MakeupPaletteOrnament({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 230 190" fill="none" aria-hidden="true" className={className}>
      <ellipse cx="114" cy="100" rx="82" ry="58" fill="currentColor" fillOpacity="0.08" />

      <g
        transform="rotate(-9 112 96)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Tutup cermin atas */}
        <rect x="44" y="26" width="124" height="58" rx="9" fill="currentColor" fillOpacity="0.06" />
        <rect x="52" y="33" width="108" height="44" rx="5" strokeWidth="0.9" strokeOpacity="0.7" />
        <line x1="72" y1="70" x2="104" y2="40" strokeWidth="0.9" strokeOpacity="0.45" />
        <line x1="88" y1="70" x2="112" y2="48" strokeWidth="0.8" strokeOpacity="0.35" />

        {/* Engsel */}
        <rect x="86" y="84" width="40" height="4" rx="2" fill="currentColor" fillOpacity="0.2" />

        {/* Wadah palet 6 pan warna */}
        <rect x="44" y="88" width="124" height="62" rx="9" fill="currentColor" fillOpacity="0.11" />

        {/* Baris atas 3 pan */}
        <circle cx="70" cy="106" r="10.5" fill="currentColor" fillOpacity="0.14" strokeWidth="1" />
        <circle cx="106" cy="106" r="10.5" fill="currentColor" fillOpacity="0.22" strokeWidth="1" />
        <circle cx="142" cy="106" r="10.5" fill="currentColor" fillOpacity="0.12" strokeWidth="1" />

        {/* Baris bawah 3 pan */}
        <circle cx="70" cy="132" r="10.5" fill="currentColor" fillOpacity="0.20" strokeWidth="1" />
        <circle cx="106" cy="132" r="10.5" fill="currentColor" fillOpacity="0.12" strokeWidth="1" />
        <circle cx="142" cy="132" r="10.5" fill="currentColor" fillOpacity="0.18" strokeWidth="1" />
      </g>

      {/* Kuas eyeshadow ramping mendampingi di kanan */}
      <g
        transform="rotate(18 186 106)"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M182 68L186 154C186.5 156.5 190 156.5 190.5 154L194 68Z"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <rect x="182" y="54" width="12" height="14" rx="1.5" fill="currentColor" fillOpacity="0.06" />
        <path
          d="M182 54C182 40 185 33 188 33C191 33 194 40 194 54Z"
          fill="currentColor"
          fillOpacity="0.17"
        />
      </g>

      {/* Kilau beauty sparkles */}
      <path
        d="M28 56L30 62L36 64L30 66L28 72L26 66L20 64L26 62Z"
        fill="currentColor"
        fillOpacity="0.52"
      />
      <path
        d="M196 36L197.5 40.5L202 42L197.5 43.5L196 48L194.5 43.5L190 42L194.5 40.5Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </svg>
  );
}

/**
 * Cermin tangan oval bergaya klasik dengan mahkota bunga kecil & kilau kaca
 */
export function HandMirrorOrnament({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 180 230" fill="none" aria-hidden="true" className={className}>
      <ellipse cx="92" cy="100" rx="58" ry="70" fill="currentColor" fillOpacity="0.08" />

      <g
        transform="rotate(11 90 118)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Mahkota kelopak kecil di puncak cermin */}
        <path d="M90 18C86 24 86 29 90 33C94 29 94 24 90 18Z" fill="currentColor" fillOpacity="0.16" />
        <path d="M90 33C82 28 76 30 76 35C82 37 87 35 90 33Z" fill="currentColor" fillOpacity="0.13" />
        <path d="M90 33C98 28 104 30 104 35C98 37 93 35 90 33Z" fill="currentColor" fillOpacity="0.13" />

        {/* Bingkai cermin oval ganda */}
        <ellipse cx="90" cy="86" rx="42" ry="52" fill="currentColor" fillOpacity="0.09" />
        <ellipse cx="90" cy="86" rx="34" ry="44" fill="#FFF9F5" fillOpacity="0.4" strokeWidth="1" />

        {/* Pantulan kilau cermin */}
        <line x1="68" y1="96" x2="102" y2="60" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="78" y1="104" x2="110" y2="70" strokeWidth="0.85" strokeOpacity="0.4" />

        {/* Gagang ramping elegan + mutiara ujung */}
        <path
          d="M84 138L86 196C86.2 200 93.8 200 94 196L96 138"
          fill="currentColor"
          fillOpacity="0.14"
        />
        <path d="M81 144H99" strokeWidth="0.95" strokeOpacity="0.65" />
        <circle cx="90" cy="204" r="4.5" fill="currentColor" fillOpacity="0.18" />
      </g>

      <path
        d="M36 78L38 83L43 85L38 87L36 92L34 87L29 85L34 83Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M148 134L149.5 138.5L154 140L149.5 141.5L148 146L146.5 141.5L142 140L146.5 138.5Z"
        fill="currentColor"
        fillOpacity="0.48"
      />
    </svg>
  );
}

/**
 * Tongkat maskara & siluet bulu mata lentik untuk section Testimoni
 */
export function LashWandOrnament({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 180 200" fill="none" aria-hidden="true" className={className}>
      <circle cx="90" cy="100" r="56" fill="currentColor" fillOpacity="0.08" />

      {/* Siluet kelopak & bulu mata lentik halus di bagian atas */}
      <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round">
        <path d="M46 72C68 86 98 86 122 68" />
        <path d="M58 77L50 64" strokeWidth="1" />
        <path d="M72 82L67 66" strokeWidth="1" />
        <path d="M86 83L85 66" strokeWidth="1" />
        <path d="M100 80L104 64" strokeWidth="1" />
        <path d="M113 74L121 59" strokeWidth="1" />
      </g>

      {/* Tongkat aplikator maskara miring di bawah */}
      <g
        transform="rotate(-24 96 132)"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="36"
          y="124"
          width="52"
          height="14"
          rx="4"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <line x1="88" y1="131" x2="120" y2="131" />
        <ellipse
          cx="134"
          cy="131"
          rx="14"
          ry="5.5"
          fill="currentColor"
          fillOpacity="0.14"
        />
        <line x1="125" y1="124" x2="125" y2="138" strokeWidth="0.85" />
        <line x1="131" y1="123" x2="131" y2="139" strokeWidth="0.85" />
        <line x1="137" y1="123" x2="137" y2="139" strokeWidth="0.85" />
        <line x1="143" y1="125" x2="143" y2="137" strokeWidth="0.85" />
      </g>

      <path
        d="M144 48L146 53L151 55L146 57L144 62L142 57L137 55L142 53Z"
        fill="currentColor"
        fillOpacity="0.52"
      />
      <path
        d="M44 148L45.5 152L49.5 153.5L45.5 155L44 159L42.5 155L38.5 153.5L42.5 152Z"
        fill="currentColor"
        fillOpacity="0.45"
      />
    </svg>
  );
}

/**
 * Botol lip gloss / serum wajah cantik dengan aplikator ramping
 */
export function LipGlossOrnament({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 170 210" fill="none" aria-hidden="true" className={className}>
      <circle cx="88" cy="110" r="54" fill="currentColor" fillOpacity="0.08" />

      <g
        transform="rotate(10 86 112)"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Tabung lip gloss kaca */}
        <rect
          x="50"
          y="94"
          width="36"
          height="78"
          rx="8"
          fill="currentColor"
          fillOpacity="0.07"
        />
        {/* Isi cairan tint lembut */}
        <rect
          x="55"
          y="108"
          width="26"
          height="58"
          rx="5"
          fill="currentColor"
          fillOpacity="0.16"
          strokeWidth="0.85"
          strokeOpacity="0.55"
        />
        {/* Leher botol */}
        <rect x="59" y="80" width="18" height="14" rx="2" fill="currentColor" fillOpacity="0.1" />

        {/* Aplikator wand berdiri di sebelah kanan */}
        <rect
          x="98"
          y="42"
          width="24"
          height="38"
          rx="5"
          fill="currentColor"
          fillOpacity="0.14"
        />
        <line x1="110" y1="80" x2="110" y2="146" strokeWidth="1.1" />
        <path
          d="M106 146C106 156 108 164 110 164C112 164 114 156 114 146Z"
          fill="currentColor"
          fillOpacity="0.22"
        />
      </g>

      {/* Tetes serum & kilau */}
      <circle cx="40" cy="64" r="1.6" fill="currentColor" fillOpacity="0.45" />
      <path
        d="M138 96L140 101L145 103L140 105L138 110L136 105L131 103L136 101Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M44 154L45.5 158L49.5 159.5L45.5 161L44 165L42.5 161L38.5 159.5L42.5 158Z"
        fill="currentColor"
        fillOpacity="0.45"
      />
    </svg>
  );
}

/**
 * Klaster kilau bintang makeup (shimmer sparkles) empat sudut untuk aksen foto & kartu
 */
export function BeautySparkleCluster({ className = '' }: OrnamentProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className}>
      {/* Bintang besar halus */}
      <path
        d="M66 18L71 45L98 50L71 55L66 82L61 55L34 50L61 45Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinejoin="round"
      />
      {/* Bintang sedang */}
      <path
        d="M30 74L32.8 84.2L43 87L32.8 89.8L30 100L27.2 89.8L17 87L27.2 84.2Z"
        fill="currentColor"
        fillOpacity="0.42"
      />
      {/* Bintang kecil */}
      <path
        d="M94 82L95.8 88.2L102 90L95.8 91.8L94 98L92.2 91.8L86 90L92.2 88.2Z"
        fill="currentColor"
        fillOpacity="0.38"
      />
      {/* Titik shimmer */}
      <circle cx="96" cy="28" r="2" fill="currentColor" fillOpacity="0.45" />
      <circle cx="32" cy="34" r="1.5" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

/**
 * Pembatas antarbagian dengan ikon kuas rias menyilang tipis & kilau satin
 */
export function MakeupDivider({ className = '' }: OrnamentProps) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-12 sm:w-24 bg-current opacity-25" />
      <svg viewBox="0 0 76 30" fill="none" className="w-16 h-7 opacity-75">
        <path
          d="M4 15H24M52 15H72"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeOpacity="0.35"
        />
        {/* Sepasang kuas mini menyilang */}
        <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M27 25L45 7" />
          <path
            d="M45 7C47 3.5 51 3 52.5 4.5C54 6 53.5 10 50 12Z"
            fill="currentColor"
            fillOpacity="0.22"
          />
          <path d="M49 25L31 7" />
          <path
            d="M31 7C29 3.5 25 3 23.5 4.5C22 6 22.5 10 26 12Z"
            fill="currentColor"
            fillOpacity="0.22"
          />
        </g>
        {/* Kilau kecil di atas persilangan */}
        <path
          d="M38 1L39.3 4.7L43 6L39.3 7.3L38 11L36.7 7.3L33 6L36.7 4.7Z"
          fill="currentColor"
          fillOpacity="0.65"
        />
      </svg>
      <span className="h-px w-12 sm:w-24 bg-current opacity-25" />
    </div>
  );
}
