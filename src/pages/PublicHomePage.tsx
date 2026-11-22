import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { BrandPreloader } from '../components/landing/BrandPreloader';
import { LandingPageView } from '../components/landing/LandingPageView';
import { useSeoHead } from '../hooks/useSeoHead';
import { fetchPublishedSnapshot } from '../lib/cmsService';
import { DEFAULT_DEMO_SNAPSHOT } from '../lib/defaults';
import type { PublishedSnapshot } from '../types/cms';

const MIN_PRELOADER_MS = 1250;

export function PublicHomePage() {
  const [snapshot, setSnapshot] = useState<PublishedSnapshot>(DEFAULT_DEMO_SNAPSHOT);
  const [dataReady, setDataReady] = useState(false);
  const [minDelayDone, setMinDelayDone] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [preloaderExiting, setPreloaderExiting] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [hideBanner, setHideBanner] = useState(false);

  useSeoHead(snapshot.settings, false);

  useEffect(() => {
    let active = true;

    const minTimer = window.setTimeout(() => {
      if (active) setMinDelayDone(true);
    }, MIN_PRELOADER_MS);

    fetchPublishedSnapshot()
      .then((res) => {
        if (!active) return;
        setSnapshot(res.snapshot);
        setIsConfigured(res.isConfigured);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat data website.');
      })
      .finally(() => {
        if (active) setDataReady(true);
      });

    return () => {
      active = false;
      window.clearTimeout(minTimer);
    };
  }, []);

  useEffect(() => {
    if (!dataReady || !minDelayDone) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      setPreloaderVisible(false);
      setHeroReady(true);
      return;
    }

    setPreloaderExiting(true);

    const heroTimer = window.setTimeout(() => {
      setHeroReady(true);
    }, 170);

    const hideTimer = window.setTimeout(() => {
      setPreloaderVisible(false);
    }, 720);

    return () => {
      window.clearTimeout(heroTimer);
      window.clearTimeout(hideTimer);
    };
  }, [dataReady, minDelayDone]);

  const topBanner =
    dataReady && (!isConfigured || error) && !hideBanner ? (
      <div className="bg-[#F8E6EB] border-b border-[#B96B78]/25 text-[#594448] px-4 py-2.5 text-xs sm:text-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#8F454B]" />
            <span>
              {error
                ? `Gagal terhubung ke Supabase (${error}). Menampilkan konten demo awal.`
                : 'Supabase belum dikonfigurasi pada server Cloudflare/.env. Menampilkan konten demo awal — silakan lengkapi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHideBanner(true)}
            className="p-1 rounded hover:bg-[#FFF9F5]/60 text-[#8F454B]"
            aria-label="Tutup pemberitahuan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    ) : null;

  return (
    <>
      <BrandPreloader
        visible={preloaderVisible}
        exiting={preloaderExiting}
        businessName={snapshot.settings.business_name}
      />
      {dataReady && (
        <LandingPageView snapshot={snapshot} topBanner={topBanner} heroReady={heroReady} />
      )}
    </>
  );
}
