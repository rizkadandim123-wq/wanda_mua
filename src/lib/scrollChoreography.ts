type StageEntry = {
  el: HTMLElement;
  lastOpacity: number;
  lastY: number;
};

type ParallaxEntry = {
  el: HTMLElement;
  amplitude: number;
  lastPy: number;
};

const stageEntries = new Set<StageEntry>();
const parallaxEntries = new Set<ParallaxEntry>();

let rafId = 0;
let listenersBound = false;
let reducedMotionCached = false;

function refreshReducedMotion(): boolean {
  reducedMotionCached =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reducedMotionCached;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Optimasi scroll 60fps tanpa layout thrashing & tanpa CSS custom property cascade:
 * 1. FASE BACA: kumpulkan semua rect sekaligus sebelum menyentuh DOM style.
 * 2. FASE TULIS: tulis langsung ke style.opacity & style.transform (dibulatkan ke piksel bulat
 *    agar teks & foto selalu tajam tanpa subpixel blur), dan lewati elemen yang di luar layar
 *    atau nilainya belum berubah.
 */
function updateAll() {
  rafId = 0;
  if (typeof window === 'undefined') return;

  const vh = window.innerHeight || 800;
  const isCompact = window.innerWidth < 768;

  if (reducedMotionCached) {
    for (const entry of stageEntries) {
      if (entry.lastOpacity !== 1 || entry.lastY !== 0) {
        entry.el.style.opacity = '';
        entry.el.style.transform = '';
        entry.lastOpacity = 1;
        entry.lastY = 0;
      }
    }
    for (const entry of parallaxEntries) {
      if (entry.lastPy !== 0) {
        entry.el.style.transform = '';
        entry.lastPy = 0;
      }
    }
    return;
  }

  // FASE 1 — READ ONLY (mencegah forced synchronous reflow)
  const stageReads: Array<{ entry: StageEntry; top: number; bottom: number }> = [];
  for (const entry of stageEntries) {
    const rect = entry.el.getBoundingClientRect();
    stageReads.push({ entry, top: rect.top, bottom: rect.bottom });
  }

  const parallaxReads: Array<{
    entry: ParallaxEntry;
    top: number;
    bottom: number;
    height: number;
  }> = [];
  for (const entry of parallaxEntries) {
    const rect = entry.el.getBoundingClientRect();
    if (rect.bottom < -120 || rect.top > vh + 120) continue;
    parallaxReads.push({ entry, top: rect.top, bottom: rect.bottom, height: rect.height });
  }

  // FASE 2 — WRITE ONLY (nilai bulat & dirty-checked agar tajam dan minim repaint)
  const maxShift = isCompact ? 10 : 16;
  const enterBand = vh * 0.22;
  const exitBand = vh * 0.24;

  for (const item of stageReads) {
    const { entry, top, bottom } = item;

    // Lewati section yang sangat jauh di luar viewport jika sudah dalam kondisi tenang
    if (top > vh + 240 || bottom < -240) continue;

    let opacity = 1;
    let shiftY = 0;

    if (top > vh - enterBand) {
      const t = clamp((top - (vh - enterBand)) / (enterBand + 60), 0, 1);
      opacity = 1 - t * 0.35;
      shiftY = Math.round(t * maxShift);
    } else if (bottom < exitBand) {
      const t = clamp((exitBand - bottom) / (exitBand + 80), 0, 1);
      opacity = 1 - t * 0.38;
      shiftY = Math.round(-t * maxShift);
    }

    const roundedOpacity = Math.round(opacity * 100) / 100;
    if (roundedOpacity !== entry.lastOpacity) {
      entry.el.style.opacity = roundedOpacity >= 1 ? '' : String(roundedOpacity);
      entry.lastOpacity = roundedOpacity;
    }
    if (shiftY !== entry.lastY) {
      // Kosongkan transform saat 0 agar teks & foto kembali 100% tajam pada pixel grid
      entry.el.style.transform = shiftY === 0 ? '' : `translate3d(0, ${shiftY}px, 0)`;
      entry.lastY = shiftY;
    }
  }

  for (const item of parallaxReads) {
    const { entry, top, height } = item;
    const centerOffset = (top + height * 0.5 - vh * 0.5) / (vh * 0.65);
    const normalized = clamp(centerOffset, -1, 1);
    const amp = isCompact ? entry.amplitude * 0.5 : entry.amplitude;
    const py = Math.round(-normalized * amp);

    if (py !== entry.lastPy) {
      entry.el.style.transform = `translate3d(0, ${py}px, 0) scale(1.035)`;
      entry.lastPy = py;
    }
  }
}

function scheduleUpdate() {
  if (rafId || typeof window === 'undefined') return;
  rafId = window.requestAnimationFrame(updateAll);
}

function handleResize() {
  refreshReducedMotion();
  scheduleUpdate();
}

function bindListeners() {
  if (listenersBound || typeof window === 'undefined') return;
  listenersBound = true;
  refreshReducedMotion();
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });
}

function unbindIfIdle() {
  if (!listenersBound || typeof window === 'undefined') return;
  if (stageEntries.size === 0 && parallaxEntries.size === 0) {
    listenersBound = false;
    window.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', handleResize);
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }
}

export function registerSectionStage(el: HTMLElement): () => void {
  const entry: StageEntry = { el, lastOpacity: 1, lastY: 0 };
  stageEntries.add(entry);
  bindListeners();
  scheduleUpdate();

  return () => {
    el.style.opacity = '';
    el.style.transform = '';
    stageEntries.delete(entry);
    unbindIfIdle();
  };
}

export function registerPhotoParallax(el: HTMLElement, amplitude = 10): () => void {
  const entry: ParallaxEntry = { el, amplitude, lastPy: Number.NaN };
  parallaxEntries.add(entry);
  bindListeners();
  scheduleUpdate();

  return () => {
    el.style.transform = '';
    parallaxEntries.delete(entry);
    unbindIfIdle();
  };
}
