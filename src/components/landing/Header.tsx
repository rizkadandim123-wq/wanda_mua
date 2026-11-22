import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { resolveBrandLogoUrl } from '../../lib/defaults';
import type { PublishedSettings, SectionKey } from '../../types/cms';
import { FormattedText, stripTextFormatting } from '../common/FormattedTitle';

interface HeaderProps {
  settings: PublishedSettings;
  hasTestimonials?: boolean;
}

const NAV_LABELS: Array<{ key: SectionKey; label: string; href: string }> = [
  { key: 'about', label: 'Tentang', href: '#tentang' },
  { key: 'services', label: 'Layanan', href: '#layanan' },
  { key: 'portfolio', label: 'Portofolio', href: '#portofolio' },
  { key: 'testimonials', label: 'Testimoni', href: '#testimoni' },
  { key: 'contact', label: 'Kontak', href: '#kontak' },
];

export function Header({ settings, hasTestimonials = false }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');
  const topBarRef = useRef<HTMLDivElement>(null);
  const pendingTargetRef = useRef<string | null>(null);
  const pendingTimerRef = useRef<number | null>(null);
  const scheduleUpdateRef = useRef<() => void>(() => {});

  const visibleNav: Array<{ key: string; label: string; href: string }> = [];
  for (const item of NAV_LABELS) {
    if (item.key === 'contact') {
      visibleNav.push({ key: 'partner', label: 'Daymoment', href: '#partner' });
    }
    if (item.key === 'testimonials' && !hasTestimonials) continue;
    if (settings.section_visibility[item.key] === false) continue;
    visibleNav.push(item);
  }

  const navIds = ['beranda', ...visibleNav.map((item) => item.href.slice(1))].join(',');

  const handleNavClick = (id: string) => {
    pendingTargetRef.current = id;
    setActiveSection(id);
    if (pendingTimerRef.current !== null) window.clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = window.setTimeout(() => {
      pendingTargetRef.current = null;
      pendingTimerRef.current = null;
      scheduleUpdateRef.current();
    }, 1800);
  };

  useEffect(() => {
    const ids = new Set(navIds.split(','));
    let frame = 0;
    let cachedSections: HTMLElement[] = [];
    let cachedMarker = 160;

    const refreshCache = () => {
      cachedSections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]')).filter(
        (section) => ids.has(section.id)
      );
      cachedMarker =
        (topBarRef.current?.getBoundingClientRect().height ?? 80) +
        Math.min(96, window.innerHeight * 0.18);
    };

    const updateActiveSection = () => {
      frame = 0;
      if (cachedSections.length === 0) refreshCache();
      let current = cachedSections[0]?.id ?? 'beranda';

      for (const section of cachedSections) {
        if (section.getBoundingClientRect().top <= cachedMarker) current = section.id;
        else break;
      }

      if (pendingTargetRef.current) {
        if (current !== pendingTargetRef.current) return;
        pendingTargetRef.current = null;
      }
      setActiveSection((previous) => (previous === current ? previous : current));
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };
    scheduleUpdateRef.current = scheduleUpdate;

    const handleResize = () => {
      refreshCache();
      scheduleUpdate();
    };

    const cancelPending = () => {
      if (!pendingTargetRef.current) return;
      pendingTargetRef.current = null;
      scheduleUpdate();
    };

    refreshCache();
    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('wheel', cancelPending, { passive: true });
    window.addEventListener('touchstart', cancelPending, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      if (pendingTimerRef.current !== null) window.clearTimeout(pendingTimerRef.current);
      pendingTargetRef.current = null;
      scheduleUpdateRef.current = () => {};
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', cancelPending);
      window.removeEventListener('touchstart', cancelPending);
    };
  }, [navIds]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  const logoUrl = resolveBrandLogoUrl(settings.logo_url);
  const showLogo =
    settings.brand_display_mode === 'logo' || settings.brand_display_mode === 'both';
  const showText =
    settings.brand_display_mode === 'text' || settings.brand_display_mode === 'both';

  return (
    <header
      className="sticky top-0 z-40 border-b shadow-[0_8px_28px_-22px_rgba(143,69,75,0.42)]"
      style={{
        backgroundColor: 'var(--color-ivory)',
        borderColor: 'color-mix(in srgb, var(--color-accent) 32%, transparent)',
      }}
    >
      <div ref={topBarRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3">
        {/* Identitas Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 py-1">
          {showLogo && (
            <a
              href="#beranda"
              onClick={() => handleNavClick('beranda')}
              className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] group"
            >
              <img
                src={logoUrl}
                alt={stripTextFormatting(`${settings.business_name} ${settings.business_subtext}`.trim())}
                className={`${
                  showText
                    ? 'h-10 sm:h-14 max-w-[48px] sm:max-w-[140px]'
                    : 'h-12 sm:h-16 max-w-[56px] sm:max-w-[180px]'
                } w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]`}
              />
            </a>
          )}
          <span className="flex flex-col leading-none min-w-0">
            {showText ? (
              <a
                href="#beranda"
                onClick={() => handleNavClick('beranda')}
                className="flex flex-col rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                <span
                  className="landing-serif text-base sm:text-[1.32rem] font-semibold tracking-[0.1em] sm:tracking-[0.16em] uppercase truncate"
                  style={{ color: 'var(--color-heading)' }}
                >
                  <FormattedText text={settings.business_name} />
                </span>
                {settings.business_subtext && (
                  <span
                    className="text-[9px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.28em] uppercase mt-1 opacity-80 truncate"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <FormattedText text={settings.business_subtext} />
                  </span>
                )}
              </a>
            ) : (
              <span className="sr-only">
                {stripTextFormatting(`${settings.business_name} ${settings.business_subtext}`)}
              </span>
            )}
          </span>
        </div>

        {/* Navigasi Desktop */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 rounded-full border p-1" aria-label="Navigasi utama" style={{ borderColor: 'color-mix(in srgb, var(--color-accent) 18%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-blush) 28%, var(--color-ivory))' }}>
          <a
            href="#beranda"
            onClick={() => handleNavClick('beranda')}
            aria-current={activeSection === 'beranda' ? 'location' : undefined}
            className={`landing-nav-link ${activeSection === 'beranda' ? 'is-active' : ''}`}
          >
            Beranda
          </a>
          {visibleNav.map((item) => (
            <a
              key={item.key}
              href={item.href}
              onClick={() => handleNavClick(item.href.slice(1))}
              aria-current={activeSection === item.href.slice(1) ? 'location' : undefined}
              className={`landing-nav-link ${activeSection === item.href.slice(1) ? 'is-active' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Badge by DaySheet Desktop & Tombol Hamburger Mobile */}
        <div className="flex shrink-0 items-center gap-2.5">
          {/* Badge by DaySheet di Menubar Desktop */}
          <a
            href="https://daysheet.id"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Dibuat oleh DaySheet (daysheet.id)"
            title="Powered by DaySheet"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-full border pl-2.5 pr-1.5 py-1 transition-colors duration-200 hover:bg-[var(--color-blush)]/65 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-blush) 26%, var(--color-ivory))',
              borderColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
              color: 'var(--color-body)',
            }}
          >
            <span className="text-[10px] uppercase tracking-[0.14em] font-medium opacity-75">
              by
            </span>
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border overflow-hidden shrink-0"
              style={{ borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)' }}
            >
              <img
                src="/daysheet-logo.png"
                alt="DaySheet"
                className="w-full h-full object-contain p-0.5"
              />
            </span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden inline-flex shrink-0 items-center justify-center w-11 h-11 rounded-full border transition-colors"
            style={{
              backgroundColor: mobileOpen ? 'var(--color-blush)' : 'var(--color-ivory)',
              borderColor: mobileOpen
                ? 'var(--color-accent)'
                : 'color-mix(in srgb, var(--color-accent) 28%, transparent)',
              color: 'var(--color-heading)',
            }}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="lg:hidden absolute inset-x-0 top-full border-b px-4 sm:px-6 py-4 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain shadow-[0_18px_32px_-20px_rgba(143,69,75,0.42)]"
          style={{
            backgroundColor: 'var(--color-ivory)',
            borderColor: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
          }}
        >
          <nav className="flex flex-col gap-2" aria-label="Navigasi seluler">
            <a
              href="#beranda"
              onClick={() => { handleNavClick('beranda'); setMobileOpen(false); }}
              aria-current={activeSection === 'beranda' ? 'location' : undefined}
              className={`landing-mobile-nav-link ${activeSection === 'beranda' ? 'is-active' : ''}`}
            >
              Beranda
            </a>
            {visibleNav.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={() => { handleNavClick(item.href.slice(1)); setMobileOpen(false); }}
                aria-current={activeSection === item.href.slice(1) ? 'location' : undefined}
                className={`landing-mobile-nav-link ${activeSection === item.href.slice(1) ? 'is-active' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Logo DaySheet di bagian bawah drawer hamburger mobile (tidak mengganggu navigasi) */}
          <div className="mt-4 pt-3.5 border-t flex items-center justify-center" style={{ borderColor: 'color-mix(in srgb, var(--color-accent) 16%, transparent)' }}>
            <a
              href="https://daysheet.id"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              aria-label="Dibuat oleh DaySheet (daysheet.id)"
              className="inline-flex items-center gap-2 rounded-full border pl-3.5 pr-2 py-1.5 transition-colors hover:bg-[var(--color-blush)]/65"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-blush) 28%, var(--color-ivory))',
                borderColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
                color: 'var(--color-body)',
              }}
            >
              <span className="text-[11px] uppercase tracking-[0.16em] font-medium opacity-80">
                by
              </span>
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border overflow-hidden shrink-0"
                style={{ borderColor: 'color-mix(in srgb, var(--color-accent) 22%, transparent)' }}
              >
                <img
                  src="/daysheet-logo.png"
                  alt="DaySheet"
                  className="w-full h-full object-contain p-0.5"
                />
              </span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
