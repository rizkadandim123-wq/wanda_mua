import { Save } from 'lucide-react';
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminFormBarProps {
  isDirty: boolean;
  saving: boolean;
  saveError?: string | null;
  saveSuccess?: string | null;
  saveLabel?: string;
}

export function AdminFormBar({
  isDirty,
  saving,
  saveError,
  saveSuccess,
  saveLabel = 'Simpan Draft',
}: AdminFormBarProps) {
  const blocker = useUnsavedChanges(isDirty);

  return (
    <>
      {saveError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {saveError}
        </div>
      )}

      {saveSuccess && !saveError && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {saveSuccess}
        </div>
      )}

      <div className="sticky bottom-3 z-20 rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5]/95 backdrop-blur-md px-5 py-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-[#594448]">
          {saving ? (
            <span className="text-[#8F454B] font-medium">Menyimpan perubahan ke draft...</span>
          ) : isDirty ? (
            <span className="text-amber-800 font-medium">
              Ada perubahan yang belum disimpan ke draft.
            </span>
          ) : (
            <span className="text-[#594448]/75">Semua perubahan pada halaman ini tersimpan.</span>
          )}
        </p>

        <button
          type="submit"
          disabled={saving || !isDirty}
          className="inline-flex items-center gap-2 rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-45"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : saveLabel}</span>
        </button>
      </div>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Perubahan Belum Disimpan"
        description="Anda memiliki perubahan yang belum disimpan pada halaman ini. Jika keluar sekarang, perubahan tersebut akan hilang."
        confirmLabel="Tetap Tinggalkan Halaman"
        cancelLabel="Kembali Mengedit"
        tone="danger"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  );
}
