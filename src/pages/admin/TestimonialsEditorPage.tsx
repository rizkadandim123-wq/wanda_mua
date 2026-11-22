import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Info,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { AdminFormBar } from '../../components/admin/AdminFormBar';
import { TextFormatHint } from '../../components/admin/TextFormatHint';
import { useAdminCms } from '../../components/admin/AdminContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/ToastProvider';
import {
  deleteTestimonial,
  reorderTestimonials,
  updateSiteSettings,
  upsertTestimonial,
} from '../../lib/cmsService';
import { DEFAULT_SITE_COPY } from '../../lib/defaults';
import type { TestimonialItem } from '../../types/cms';

interface TestimonialFormState {
  id?: string;
  client_name: string;
  rating: number;
  quote: string;
  is_visible: boolean;
}

export function TestimonialsEditorPage() {
  const { bundle, reloadBundle } = useAdminCms();
  const { showToast } = useToast();

  const [sectionEyebrow, setSectionEyebrow] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [savingHeading, setSavingHeading] = useState(false);
  const [headingError, setHeadingError] = useState<string | null>(null);
  const [headingSuccess, setHeadingSuccess] = useState<string | null>(null);

  const [editingForm, setEditingForm] = useState<TestimonialFormState | null>(null);
  const [savingItem, setSavingItem] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!bundle) return;
    const copy = bundle.settings.site_copy ?? DEFAULT_SITE_COPY;
    setSectionEyebrow(copy.testimonials_eyebrow);
    setSectionTitle(bundle.settings.testimonials_title);
    setSectionSubtitle(bundle.settings.testimonials_subtitle ?? '');
  }, [bundle]);

  if (!bundle) return null;
  const currentCopy = bundle.settings.site_copy ?? DEFAULT_SITE_COPY;

  const isDirty =
    sectionEyebrow !== currentCopy.testimonials_eyebrow ||
    sectionTitle !== bundle.settings.testimonials_title ||
    sectionSubtitle !== (bundle.settings.testimonials_subtitle ?? '') ||
    editingForm !== null;

  const handleSaveHeading = async (e: FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) {
      setHeadingError('Judul bagian Testimoni wajib diisi.');
      return;
    }
    setSavingHeading(true);
    setHeadingError(null);
    setHeadingSuccess(null);
    try {
      await updateSiteSettings({
        testimonials_title: sectionTitle.trim(),
        testimonials_subtitle: sectionSubtitle.trim(),
        site_copy: {
          testimonials_eyebrow: sectionEyebrow.trim() || 'Kind Words',
        },
      });
      await reloadBundle();
      setHeadingSuccess('Judul & subjudul bagian Testimoni tersimpan ke draft.');
      showToast('Judul & subjudul Testimoni tersimpan.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan judul.';
      setHeadingError(msg);
      showToast(msg, 'error');
    } finally {
      setSavingHeading(false);
    }
  };

  const openModal = (item?: TestimonialItem) => {
    setItemError(null);
    if (!item) {
      setEditingForm({
        client_name: '',
        rating: 5,
        quote: '',
        is_visible: true,
      });
      return;
    }
    setEditingForm({
      id: item.id,
      client_name: item.client_name,
      rating: Math.min(5, Math.max(1, Number(item.rating ?? 5))),
      quote: item.quote,
      is_visible: item.is_visible,
    });
  };

  const handleSaveItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingForm) return;
    if (!editingForm.client_name.trim() || !editingForm.quote.trim()) {
      setItemError('Nama pelanggan dan deskripsi ulasan wajib diisi.');
      return;
    }

    setSavingItem(true);
    setItemError(null);
    try {
      const sortOrder = editingForm.id
        ? (bundle.testimonials.find((t) => t.id === editingForm.id)?.sort_order ?? 1)
        : (bundle.testimonials[bundle.testimonials.length - 1]?.sort_order ?? 0) + 1;

      await upsertTestimonial({
        id: editingForm.id,
        client_name: editingForm.client_name.trim(),
        rating: editingForm.rating,
        quote: editingForm.quote.trim(),
        sort_order: sortOrder,
        is_visible: editingForm.is_visible,
      });

      await reloadBundle();
      setEditingForm(null);
      showToast('Testimoni berhasil disimpan ke draft.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan testimoni.';
      setItemError(msg);
      showToast(msg, 'error');
    } finally {
      setSavingItem(false);
    }
  };

  const handleToggleVisible = async (item: TestimonialItem) => {
    try {
      await upsertTestimonial({
        id: item.id,
        client_name: item.client_name,
        quote: item.quote,
        is_visible: !item.is_visible,
      });
      await reloadBundle();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah status.', 'error');
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= bundle.testimonials.length) return;
    const ids = bundle.testimonials.map((t) => t.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(targetIdx, 0, moved);
    try {
      await reorderTestimonials(ids);
      await reloadBundle();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengurutkan.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTestimonial(deleteTarget.id);
      await reloadBundle();
      setDeleteTarget(null);
      showToast('Testimoni dihapus dari draft.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus testimoni.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#8F454B]">Testimoni Pelanggan</h1>
          <p className="text-sm text-[#594448]/80 mt-1">
            Atur judul, subjudul, serta ulasan pelanggan dengan nama, bintang, dan deskripsi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-5 py-2.5 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Testimoni</span>
        </button>
      </div>

      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#F8E6EB]/45 p-4 flex items-start gap-3 text-xs sm:text-sm text-[#594448]">
        <Info className="w-4 h-4 text-[#8F454B] shrink-0 mt-0.5" />
        <p>
          Jika belum ada testimoni yang aktif dan dipublikasikan, bagian dan menu{' '}
          <strong>Testimoni</strong> otomatis disembunyikan pada website publik agar tidak
          menampilkan ulasan palsu.
        </p>
      </div>

      <form
        onSubmit={handleSaveHeading}
        className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-6 space-y-4"
      >
        <h2 className="font-serif text-xl text-[#8F454B]">Judul &amp; Subjudul Bagian</h2>
        <TextFormatHint />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="testi-eyebrow" className="block text-sm font-medium text-[#8F454B]">
              Label Kecil Atas
            </label>
            <input
              id="testi-eyebrow"
              type="text"
              value={sectionEyebrow}
              onChange={(e) => setSectionEyebrow(e.target.value)}
              placeholder="Kind Words"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="testi-title" className="block text-sm font-medium text-[#8F454B]">
              Judul Bagian Testimoni
            </label>
            <input
              id="testi-title"
              type="text"
              required
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="testi-subtitle" className="block text-sm font-medium text-[#8F454B]">
              Subjudul Singkat
            </label>
            <input
              id="testi-subtitle"
              type="text"
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              placeholder="Kesan hangat dari para klien..."
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <AdminFormBar
          isDirty={isDirty}
          saving={savingHeading}
          saveError={headingError}
          saveSuccess={headingSuccess}
          saveLabel="Simpan Judul & Subjudul"
        />
      </form>

      <div className="space-y-3">
        {bundle.testimonials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#B96B78]/30 bg-[#FFF9F5] p-8 text-center text-sm text-[#594448]/75">
            Belum ada testimoni. Bagian ini disembunyikan dari pengunjung hingga Anda menambahkan
            testimoni asli dan mempublikasikannya.
          </div>
        ) : (
          bundle.testimonials.map((item, idx) => {
            const stars = Math.min(5, Math.max(1, Math.round(item.rating ?? 5)));
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-serif text-lg text-[#8F454B]">{item.client_name}</p>
                    <div className="flex items-center gap-0.5" aria-label={`${stars} bintang`}>
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 ${
                            starIdx < stars
                              ? 'text-[#B96B78] fill-[#B96B78]'
                              : 'text-[#B96B78]/30'
                          }`}
                        />
                      ))}
                    </div>
                    {!item.is_visible && (
                      <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] text-stone-700">
                        Disembunyikan
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#594448]/90">“{item.quote}”</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => void handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="p-2 rounded-lg border border-[#B96B78]/20 disabled:opacity-35"
                    aria-label="Naikkan"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleMove(idx, 1)}
                    disabled={idx === bundle.testimonials.length - 1}
                    className="p-2 rounded-lg border border-[#B96B78]/20 disabled:opacity-35"
                    aria-label="Turunkan"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggleVisible(item)}
                    className="p-2 rounded-lg border border-[#B96B78]/20"
                    aria-label={item.is_visible ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {item.is_visible ? (
                      <Eye className="w-4 h-4 text-[#B96B78]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#B96B78]/30 px-3 py-1.5 text-xs font-medium text-[#8F454B]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
                    aria-label="Hapus testimoni"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {editingForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3d282c]/45 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveItem}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFF9F5] border border-[#B96B78]/25 p-6 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-[#8F454B]">
                {editingForm.id ? 'Edit Testimoni' : 'Tambah Testimoni'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingForm(null)}
                className="p-1.5 rounded-full hover:bg-[#F8E6EB]"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {itemError && (
              <p className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-sm text-rose-800">
                {itemError}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#8F454B]">Nama Pelanggan</label>
              <input
                type="text"
                required
                value={editingForm.client_name}
                onChange={(e) =>
                  setEditingForm({ ...editingForm, client_name: e.target.value })
                }
                placeholder="Contoh: Ayu Lestari"
                className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-[#8F454B]">Rating Bintang</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const active = starValue <= editingForm.rating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setEditingForm({ ...editingForm, rating: starValue })}
                      className="p-1.5 rounded-lg border border-[#B96B78]/20 bg-white hover:bg-[#F8E6EB]/55 transition-colors"
                      aria-label={`Pilih ${starValue} bintang`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          active ? 'text-[#B96B78] fill-[#B96B78]' : 'text-[#B96B78]/30'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs text-[#594448]/80 ml-1">
                  {editingForm.rating} dari 5 bintang
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#8F454B]">Deskripsi Ulasan</label>
              <textarea
                rows={4}
                required
                value={editingForm.quote}
                onChange={(e) => setEditingForm({ ...editingForm, quote: e.target.value })}
                placeholder="Tulis kutipan pengalaman pelanggan..."
                className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={editingForm.is_visible}
                onChange={(e) => setEditingForm({ ...editingForm, is_visible: e.target.checked })}
                className="accent-[#B96B78] w-4 h-4"
              />
              <span>Tampilkan testimoni ini saat dipublikasikan</span>
            </label>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#B96B78]/15">
              <button
                type="button"
                onClick={() => setEditingForm(null)}
                className="rounded-full border border-[#B96B78]/30 px-5 py-2 text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingItem}
                className="inline-flex items-center gap-2 rounded-full bg-[#B96B78] text-white px-5 py-2 text-sm font-medium disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{savingItem ? 'Menyimpan...' : 'Simpan Testimoni'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Testimoni?"
        description={`Yakin ingin menghapus testimoni dari "${deleteTarget?.client_name ?? ''}"?`}
        confirmLabel="Ya, Hapus"
        tone="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
