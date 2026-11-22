import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchDraftBundle, publishAllDraftChanges } from '../../lib/cmsService';
import type { DraftBundle, PublishStatus } from '../../types/cms';
import { useToast } from '../common/ToastProvider';

interface AdminContextValue {
  bundle: DraftBundle | null;
  loading: boolean;
  error: string | null;
  publishStatus: PublishStatus;
  isPublishing: boolean;
  reloadBundle: () => Promise<void>;
  publishNow: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [bundle, setBundle] = useState<DraftBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const reloadBundle = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchDraftBundle();
      setBundle(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data CMS.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadBundle();
  }, [reloadBundle]);

  const publishStatus = useMemo<PublishStatus>(() => {
    if (!bundle) {
      return {
        hasUnpublishedChanges: false,
        draftVersion: 1,
        publishedDraftVersion: null,
        publishedReleaseNumber: null,
        publishedAt: null,
      };
    }

    const latest = bundle.latestPublish;
    const hasUnpublished =
      !latest || bundle.settings.draft_version > latest.draft_version_published;

    return {
      hasUnpublishedChanges: hasUnpublished,
      draftVersion: bundle.settings.draft_version,
      publishedDraftVersion: latest?.draft_version_published ?? null,
      publishedReleaseNumber: latest?.version_number ?? null,
      publishedAt: latest?.published_at ?? null,
    };
  }, [bundle]);

  const publishNow = useCallback(async () => {
    setIsPublishing(true);
    try {
      const release = await publishAllDraftChanges();
      await reloadBundle();
      showToast(
        `Berhasil dipublikasikan! Website publik kini menampilkan versi v${release.version_number}.`,
        'success'
      );
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mempublikasikan perubahan.';
      showToast(msg, 'error');
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [reloadBundle, showToast]);

  return (
    <AdminContext.Provider
      value={{
        bundle,
        loading,
        error,
        publishStatus,
        isPublishing,
        reloadBundle,
        publishNow,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminCms(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdminCms harus digunakan di dalam AdminProvider.');
  }
  return ctx;
}
