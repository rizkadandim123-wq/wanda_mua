import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, Loader2, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/ToastProvider';
import { LandingPageView } from '../components/landing/LandingPageView';
import { useSeoHead } from '../hooks/useSeoHead';
import {
  buildDraftPreviewSnapshot,
  fetchDraftBundle,
  publishAllDraftChanges,
} from '../lib/cmsService';
import { DEFAULT_DEMO_SNAPSHOT } from '../lib/defaults';
import type { PublishedSnapshot } from '../types/cms';

export function PreviewPage() {
  const { showToast } = useToast();
  const [snapshot, setSnapshot] = useState<PublishedSnapshot>(DEFAULT_DEMO_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useSeoHead(snapshot.settings, true);

  useEffect(() => {
    let active = true;
    fetchDraftBundle()
      .then((bundle) => {
        if (!active) return;
        setSnapshot(buildDraftPreviewSnapshot(bundle));
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat preview draft.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const release = await publishAllDraftChanges();
      showToast(
        `Draft berhasil dipublikasikan sebagai versi v${release.version_number}!`,
        'success'
      );
      setConfirmOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mempublikasikan draft.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F5] flex flex-col items-center justify-center gap-3 text-[#8F454B]">
        <Loader2 className="w-7 h-7 animate-spin text-[#B96B78]" />
        <p className="text-sm">Menyiapkan preview draft...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF6F4] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-rose-200 bg-white p-6 space-y-4 text-center">
          <p className="text-base font-semibold text-rose-800">Gagal memuat Preview</p>
          <p className="text-sm text-[#594448]">{error}</p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-full bg-[#B96B78] text-white px-5 py-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Admin</span>
          </Link>
        </div>
      </div>
    );
  }

  const previewBanner = (
    <div className="bg-[#594448] text-[#FFF9F5] px-4 py-2.5 text-xs sm:text-sm sticky top-0 z-50 border-b border-[#FFF9F5]/15">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#F8E6EB]" />
          <span>
            <strong>Mode Preview Draft</strong> — Hanya terlihat oleh admin yang login.
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#FFF9F5]/35 px-3.5 py-1.5 text-xs font-medium hover:bg-[#FFF9F5]/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#B96B78] hover:bg-[#a35b68] px-4 py-1.5 text-xs font-medium text-white"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Publikasikan Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <LandingPageView snapshot={snapshot} topBanner={previewBanner} />
      <ConfirmDialog
        open={confirmOpen}
        title="Publikasikan Versi Draft Ini?"
        description="Seluruh perubahan yang sedang Anda lihat pada preview akan ditayangkan ke website publik untuk seluruh pengunjung."
        confirmLabel="Ya, Publikasikan"
        loading={publishing}
        onConfirm={() => void handlePublish()}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
