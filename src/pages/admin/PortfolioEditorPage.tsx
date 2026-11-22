import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Crop,
  Expand,
  Eye,
  EyeOff,
  FolderPlus,
  ImagePlus,
  Pencil,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { AdminFormBar } from '../../components/admin/AdminFormBar';
import { useAdminCms } from '../../components/admin/AdminContext';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { TextFormatHint } from '../../components/admin/TextFormatHint';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FormattedText } from '../../components/common/FormattedTitle';
import { SmartImage } from '../../components/common/SmartImage';
import { useToast } from '../../components/common/ToastProvider';
import {
  createPortfolioItems,
  deleteCategoryWithReassign,
  deletePortfolioItem,
  reorderCategories,
  reorderPortfolioItems,
  updatePortfolioItem,
  updateSiteSettings,
  upsertCategory,
} from '../../lib/cmsService';
import { DEFAULT_SITE_COPY } from '../../lib/defaults';
import { uploadDraftImage } from '../../lib/media';
import { validateImageFile } from '../../lib/validation';
import type { PortfolioCategory, PortfolioItem } from '../../types/cms';

interface PendingBatchItem {
  key: string;
  file: File;
  previewUrl: string;
  title: string;
  alt_text: string;
  category_id: string;
}

type PortfolioFrameMode = 'wide' | 'square' | 'portrait';

/**
 * Menentukan bentuk bingkai kartu foto di galeri Bento Editorial (PortfolioSection.tsx)
 * berdasarkan urutan foto yang aktif agar preview di admin sama persis dengan website.
 */
function detectPortfolioFrameShape(
  itemId: string,
  allItems: PortfolioItem[]
): { mode: PortfolioFrameMode; label: string } {
  const visible = allItems.filter((item) => item.is_visible);
  const idx = visible.findIndex((item) => item.id === itemId);
  const total = visible.length;

  if (idx < 0 || total === 1 || total === 3) {
    return { mode: 'portrait', label: 'Potret (4:5)' };
  }
  if (total === 2) {
    return { mode: 'square', label: 'Persegi' };
  }

  const hasTrailingTrio = total >= 5 && total % 2 === 1;
  const pairLimit = hasTrailingTrio ? total - 3 : total;
  if (idx >= pairLimit) {
    return { mode: 'portrait', label: 'Potret (4:5)' };
  }

  const rowIndex = Math.floor(idx / 2);
  const posInRow = idx % 2;
  const isWide = rowIndex % 2 === 0 ? posInRow === 0 : posInRow === 1;
  return isWide
    ? { mode: 'wide', label: 'Persegi Panjang' }
    : { mode: 'square', label: 'Persegi' };
}

export function PortfolioEditorPage() {
  const { bundle, reloadBundle } = useAdminCms();
  const { showToast } = useToast();
  const multiInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'photos' | 'categories'>('photos');

  // Judul bagian Portofolio
  const [sectionEyebrow, setSectionEyebrow] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [savingHeading, setSavingHeading] = useState(false);
  const [headingError, setHeadingError] = useState<string | null>(null);
  const [headingSuccess, setHeadingSuccess] = useState<string | null>(null);

  // Batch multi-upload state
  const [batchQueue, setBatchQueue] = useState<PendingBatchItem[]>([]);
  const [uploadingBatch, setUploadingBatch] = useState(false);

  // Filter daftar foto di admin
  const [filterCatId, setFilterCatId] = useState<string>('all');

  // Edit 1 foto
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [editModalTab, setEditModalTab] = useState<'frame' | 'detail'>('frame');
  const [editFramePreview, setEditFramePreview] = useState<PortfolioFrameMode>('wide');
  const [editTitle, setEditTitle] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [editCatId, setEditCatId] = useState('');
  const [editFocusX, setEditFocusX] = useState(50);
  const [editFocusY, setEditFocusY] = useState(35);
  const [editZoom, setEditZoom] = useState(100);
  const [editVisible, setEditVisible] = useState(true);
  const [editPendingFile, setEditPendingFile] = useState<File | null>(null);
  const [editPendingUrl, setEditPendingUrl] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (!editPendingFile) {
      setEditPendingUrl(null);
      return;
    }
    const url = URL.createObjectURL(editPendingFile);
    setEditPendingUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [editPendingFile]);

  // Hapus foto
  const [deletePhotoTarget, setDeletePhotoTarget] = useState<PortfolioItem | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  // Kategori
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingCat, setEditingCat] = useState<PortfolioCategory | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Hapus kategori (termasuk penanganan jika kategori masih dipakai foto)
  const [deleteCatTarget, setDeleteCatTarget] = useState<PortfolioCategory | null>(null);
  const [reassignCatId, setReassignCatId] = useState<string>('');
  const [deletingCat, setDeletingCat] = useState(false);

  useEffect(() => {
    if (!bundle) return;
    const copy = bundle.settings.site_copy ?? DEFAULT_SITE_COPY;
    setSectionEyebrow(copy.portfolio_eyebrow);
    setSectionTitle(bundle.settings.portfolio_title);
    setSectionSubtitle(bundle.settings.portfolio_subtitle);
  }, [bundle]);

  useEffect(() => {
    return () => {
      batchQueue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [batchQueue]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of bundle?.categories ?? []) {
      map[c.id] = c.name;
    }
    return map;
  }, [bundle?.categories]);

  if (!bundle) return null;
  const currentCopy = bundle.settings.site_copy ?? DEFAULT_SITE_COPY;

  const isDirty =
    sectionEyebrow !== currentCopy.portfolio_eyebrow ||
    sectionTitle !== bundle.settings.portfolio_title ||
    sectionSubtitle !== bundle.settings.portfolio_subtitle ||
    batchQueue.length > 0 ||
    editingItem !== null;

  const filteredItems =
    filterCatId === 'all'
      ? bundle.portfolioItems
      : bundle.portfolioItems.filter((p) => p.category_id === filterCatId);

  const handleSaveHeading = async (e: FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) {
      setHeadingError('Judul bagian Portofolio wajib diisi.');
      return;
    }
    setSavingHeading(true);
    setHeadingError(null);
    setHeadingSuccess(null);
    try {
      await updateSiteSettings({
        portfolio_title: sectionTitle.trim(),
        portfolio_subtitle: sectionSubtitle.trim(),
        site_copy: {
          portfolio_eyebrow: sectionEyebrow.trim() || 'Beauty Lookbook',
        },
      });
      await reloadBundle();
      setHeadingSuccess('Judul bagian Portofolio tersimpan ke draft.');
      showToast('Judul Portofolio tersimpan.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan judul.';
      setHeadingError(msg);
      showToast(msg, 'error');
    } finally {
      setSavingHeading(false);
    }
  };

  const handleSelectMultipleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const defaultCategoryId = bundle.categories[0]?.id ?? '';
    if (!defaultCategoryId) {
      showToast('Buat minimal satu kategori terlebih dahulu sebelum mengunggah foto.', 'error');
      return;
    }

    const nextItems: PendingBatchItem[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file, idx) => {
      const check = validateImageFile(file);
      if (!check.ok) {
        errors.push(check.error);
        return;
      }
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
      nextItems.push({
        key: `${Date.now()}-${idx}-${file.name}`,
        file,
        previewUrl: URL.createObjectURL(file),
        title: baseName || 'Foto Riasan',
        alt_text: baseName || 'Foto hasil riasan Niwayuliana Makeup Artist',
        category_id: filterCatId !== 'all' ? filterCatId : defaultCategoryId,
      });
    });

    if (errors.length > 0) {
      showToast(errors[0], 'error');
    }

    if (nextItems.length > 0) {
      setBatchQueue((prev) => [...prev, ...nextItems]);
    }
    if (multiInputRef.current) {
      multiInputRef.current.value = '';
    }
  };

  const handleUploadBatch = async () => {
    if (batchQueue.length === 0) return;
    setUploadingBatch(true);
    try {
      const startOrder =
        (bundle.portfolioItems[bundle.portfolioItems.length - 1]?.sort_order ?? 0) + 1;
      const toInsert: Array<{
        category_id: string;
        title: string;
        alt_text: string;
        media_id: string | null;
        sort_order: number;
        is_visible: boolean;
      }> = [];

      for (let i = 0; i < batchQueue.length; i++) {
        const entry = batchQueue[i];
        const asset = await uploadDraftImage(
          entry.file,
          'portfolio',
          entry.alt_text || entry.title
        );
        toInsert.push({
          category_id: entry.category_id,
          title: entry.title.trim() || 'Foto Riasan',
          alt_text: entry.alt_text.trim() || entry.title.trim() || 'Foto portofolio makeup',
          media_id: asset.id,
          sort_order: startOrder + i,
          is_visible: true,
        });
      }

      await createPortfolioItems(toInsert);
      batchQueue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setBatchQueue([]);
      await reloadBundle();
      showToast(`${toInsert.length} foto portofolio berhasil ditambahkan ke draft.`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengunggah foto portofolio.', 'error');
    } finally {
      setUploadingBatch(false);
    }
  };

  const openEditPhoto = (item: PortfolioItem) => {
    const detected = detectPortfolioFrameShape(item.id, bundle.portfolioItems);
    setEditingItem(item);
    setEditModalTab('frame');
    setEditFramePreview(detected.mode);
    setEditTitle(item.title);
    setEditAlt(item.alt_text);
    setEditCatId(item.category_id);
    setEditFocusX(item.image_focus_x);
    setEditFocusY(item.image_focus_y);
    setEditZoom(item.image_zoom ?? 100);
    setEditVisible(item.is_visible);
    setEditPendingFile(null);
  };

  const handleSaveEditedPhoto = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim()) return;
    setSavingEdit(true);
    try {
      let nextMediaId = editingItem.media_id;
      let nextDemoUrl = editingItem.fallback_demo_url;
      if (editPendingFile) {
        const asset = await uploadDraftImage(
          editPendingFile,
          'portfolio',
          editAlt.trim() || editTitle.trim()
        );
        nextMediaId = asset.id;
        nextDemoUrl = null;
      }

      await updatePortfolioItem(editingItem.id, {
        title: editTitle.trim(),
        alt_text: editAlt.trim() || editTitle.trim(),
        category_id: editCatId,
        media_id: nextMediaId,
        fallback_demo_url: nextDemoUrl,
        image_focus_x: editFocusX,
        image_focus_y: editFocusY,
        image_zoom: editZoom,
        is_visible: editVisible,
      });

      await reloadBundle();
      setEditingItem(null);
      setEditPendingFile(null);
      showToast('Foto portofolio diperbarui di draft.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memperbarui foto.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleTogglePhotoVisible = async (item: PortfolioItem) => {
    try {
      await updatePortfolioItem(item.id, { is_visible: !item.is_visible });
      await reloadBundle();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah status foto.', 'error');
    }
  };

  const handleMovePhoto = async (item: PortfolioItem, direction: -1 | 1) => {
    const allIds = bundle.portfolioItems.map((p) => p.id);
    const idx = allIds.indexOf(item.id);
    const targetIdx = idx + direction;
    if (idx < 0 || targetIdx < 0 || targetIdx >= allIds.length) return;
    const [moved] = allIds.splice(idx, 1);
    allIds.splice(targetIdx, 0, moved);
    try {
      await reorderPortfolioItems(allIds);
      await reloadBundle();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah urutan.', 'error');
    }
  };

  const handleDeletePhoto = async () => {
    if (!deletePhotoTarget) return;
    setDeletingPhoto(true);
    try {
      await deletePortfolioItem(deletePhotoTarget.id);
      await reloadBundle();
      setDeletePhotoTarget(null);
      showToast('Foto portofolio dihapus dari draft.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus foto.', 'error');
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    try {
      const nextOrder =
        (bundle.categories[bundle.categories.length - 1]?.sort_order ?? 0) + 1;
      await upsertCategory({ name: newCategoryName.trim(), sort_order: nextOrder });
      setNewCategoryName('');
      await reloadBundle();
      showToast('Kategori baru ditambahkan ke draft.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menambahkan kategori.', 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleSaveRenameCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCatName.trim()) return;
    setSavingCategory(true);
    try {
      await upsertCategory({ id: editingCat.id, name: editingCatName.trim() });
      setEditingCat(null);
      await reloadBundle();
      showToast('Nama kategori diperbarui.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah kategori.', 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleMoveCategory = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= bundle.categories.length) return;
    const ids = bundle.categories.map((c) => c.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(targetIdx, 0, moved);
    try {
      await reorderCategories(ids);
      await reloadBundle();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengurutkan kategori.', 'error');
    }
  };

  const openDeleteCategoryModal = (cat: PortfolioCategory) => {
    setDeleteCatTarget(cat);
    const fallbackCat = bundle.categories.find((c) => c.id !== cat.id);
    setReassignCatId(fallbackCat?.id ?? '');
  };

  const deleteCatUsageCount = deleteCatTarget
    ? bundle.portfolioItems.filter((p) => p.category_id === deleteCatTarget.id).length
    : 0;

  const otherCategories = deleteCatTarget
    ? bundle.categories.filter((c) => c.id !== deleteCatTarget.id)
    : [];

  const handleConfirmDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    if (deleteCatUsageCount > 0 && !reassignCatId) {
      showToast('Pilih kategori pengganti terlebih dahulu.', 'error');
      return;
    }

    setDeletingCat(true);
    try {
      await deleteCategoryWithReassign(
        deleteCatTarget.id,
        deleteCatUsageCount > 0 ? reassignCatId : null
      );
      await reloadBundle();
      setDeleteCatTarget(null);
      showToast('Kategori berhasil dihapus dari draft.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus kategori.', 'error');
    } finally {
      setDeletingCat(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#8F454B]">Portofolio &amp; Kategori</h1>
          <p className="text-sm text-[#594448]/80 mt-1">
            Unggah satu atau beberapa foto riasan sekaligus, atur judul, alt text, serta kategori.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-[#B96B78]/25 bg-[#FFF9F5] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'photos' ? 'bg-[#B96B78] text-white' : 'text-[#594448]'
            }`}
          >
            Foto Portofolio ({bundle.portfolioItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'categories' ? 'bg-[#B96B78] text-white' : 'text-[#594448]'
            }`}
          >
            Kategori ({bundle.categories.length})
          </button>
        </div>
      </div>

      {/* Form Judul Bagian */}
      <form
        onSubmit={handleSaveHeading}
        className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-6 space-y-4"
      >
        <h2 className="font-serif text-xl text-[#8F454B]">Judul &amp; Subjudul Bagian</h2>
        <TextFormatHint />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="pf-eyebrow" className="block text-sm font-medium text-[#8F454B]">
              Label Kecil Atas
            </label>
            <input
              id="pf-eyebrow"
              type="text"
              value={sectionEyebrow}
              onChange={(e) => setSectionEyebrow(e.target.value)}
              placeholder="Beauty Lookbook"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pf-title" className="block text-sm font-medium text-[#8F454B]">
              Judul Bagian
            </label>
            <input
              id="pf-title"
              type="text"
              required
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pf-subtitle" className="block text-sm font-medium text-[#8F454B]">
              Subjudul Singkat
            </label>
            <input
              id="pf-subtitle"
              type="text"
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <AdminFormBar
          isDirty={isDirty}
          saving={savingHeading}
          saveError={headingError}
          saveSuccess={headingSuccess}
          saveLabel="Simpan Judul Bagian"
        />
      </form>

      {activeTab === 'photos' ? (
        <div className="space-y-6">
          {/* Upload Satu atau Beberapa Foto */}
          <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl text-[#8F454B]">Unggah Foto Portofolio</h2>
                <p className="text-xs text-[#594448]/75 mt-0.5">
                  Pilih satu atau beberapa foto sekaligus (JPG, PNG, WebP, maks. 5 MB per foto ·
                  disarankan 800 × 1000 px rasio 4:5).
                </p>
              </div>
              <div>
                <input
                  ref={multiInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleSelectMultipleFiles(e.target.files)}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => multiInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-5 py-2.5 text-sm font-medium"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span>Pilih Foto (Bisa Banyak)</span>
                </button>
              </div>
            </div>

            {batchQueue.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-[#B96B78]/15">
                <p className="text-sm font-medium text-[#8F454B]">
                  Preview sebelum disimpan ({batchQueue.length} foto siap diunggah):
                </p>

                <div className="space-y-3">
                  {batchQueue.map((item, idx) => (
                    <div
                      key={item.key}
                      className="rounded-xl border border-[#B96B78]/20 bg-white p-3.5 flex flex-col sm:flex-row gap-4 items-start"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.alt_text}
                        className="w-20 aspect-[4/5] object-cover rounded-lg shrink-0 bg-[#F8E6EB]"
                      />
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-[#8F454B]">
                            Judul Foto
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const next = [...batchQueue];
                              next[idx] = { ...item, title: e.target.value };
                              setBatchQueue(next);
                            }}
                            className="w-full rounded-lg border border-[#B96B78]/25 px-3 py-1.5 text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-[#8F454B]">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={item.alt_text}
                            onChange={(e) => {
                              const next = [...batchQueue];
                              next[idx] = { ...item, alt_text: e.target.value };
                              setBatchQueue(next);
                            }}
                            className="w-full rounded-lg border border-[#B96B78]/25 px-3 py-1.5 text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-[#8F454B]">
                            Kategori
                          </label>
                          <select
                            value={item.category_id}
                            onChange={(e) => {
                              const next = [...batchQueue];
                              next[idx] = { ...item, category_id: e.target.value };
                              setBatchQueue(next);
                            }}
                            className="w-full rounded-lg border border-[#B96B78]/25 px-3 py-1.5 text-sm bg-white"
                          >
                            {bundle.categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(item.previewUrl);
                          setBatchQueue(batchQueue.filter((q) => q.key !== item.key));
                        }}
                        className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50"
                        aria-label="Hapus dari antrean"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      batchQueue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
                      setBatchQueue([]);
                    }}
                    disabled={uploadingBatch}
                    className="rounded-full border border-[#B96B78]/30 px-4 py-2 text-xs sm:text-sm font-medium text-[#594448]"
                  >
                    Batal Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUploadBatch()}
                    disabled={uploadingBatch}
                    className="inline-flex items-center gap-2 rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-5 py-2 text-xs sm:text-sm font-medium disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {uploadingBatch
                        ? 'Mengunggah ke draft...'
                        : `Simpan ${batchQueue.length} Foto ke Draft`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter & Daftar Foto */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterCatId('all')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium border ${
                    filterCatId === 'all'
                      ? 'bg-[#B96B78] border-[#B96B78] text-white'
                      : 'bg-white border-[#B96B78]/25 text-[#594448]'
                  }`}
                >
                  Semua ({bundle.portfolioItems.length})
                </button>
                {bundle.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilterCatId(cat.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium border ${
                      filterCatId === cat.id
                        ? 'bg-[#B96B78] border-[#B96B78] text-white'
                        : 'bg-white border-[#B96B78]/25 text-[#594448]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#B96B78]/30 bg-[#FFF9F5] p-8 text-center text-sm text-[#594448]/75">
                Tidak ada foto pada kategori ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => {
                  const imgUrl = item.media_id
                    ? (bundle.mediaUrls[item.media_id] ?? null)
                    : item.fallback_demo_url;
                  const globalIdx = bundle.portfolioItems.findIndex((p) => p.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] overflow-hidden flex flex-col"
                    >
                      <div className="relative aspect-[4/5] bg-[#F8E6EB]">
                        <SmartImage
                          src={imgUrl}
                          alt={item.alt_text || item.title}
                          focusX={item.image_focus_x}
                          focusY={item.image_focus_y}
                          zoom={item.image_zoom ?? 100}
                        />
                        {!item.is_visible && (
                          <span className="absolute top-2.5 left-2.5 rounded-full bg-stone-900/75 text-white px-2.5 py-0.5 text-[11px]">
                            Disembunyikan
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-[#B96B78]">
                            {categoryMap[item.category_id] ?? 'Kategori'}
                          </span>
                          <p className="font-serif text-lg text-[#8F454B] leading-snug mt-0.5">
                            {item.title}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-[#B96B78]/15">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => void handleMovePhoto(item, -1)}
                              disabled={globalIdx <= 0}
                              className="p-1.5 rounded-lg border border-[#B96B78]/20 disabled:opacity-35"
                              aria-label="Naikkan urutan"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleMovePhoto(item, 1)}
                              disabled={globalIdx >= bundle.portfolioItems.length - 1}
                              className="p-1.5 rounded-lg border border-[#B96B78]/20 disabled:opacity-35"
                              aria-label="Turunkan urutan"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleTogglePhotoVisible(item)}
                              className="p-1.5 rounded-lg border border-[#B96B78]/20"
                              aria-label={item.is_visible ? 'Sembunyikan' : 'Tampilkan'}
                            >
                              {item.is_visible ? (
                                <Eye className="w-3.5 h-3.5 text-[#B96B78]" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditPhoto(item)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#B96B78]/30 px-2.5 py-1 text-xs font-medium text-[#8F454B] hover:bg-[#F8E6EB]/60"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletePhotoTarget(item)}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
                              aria-label={`Hapus ${item.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab Kategori Portofolio */
        <div className="space-y-5">
          <form
            onSubmit={handleAddCategory}
            className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 flex flex-col sm:flex-row gap-3 items-end"
          >
            <div className="flex-1 w-full space-y-1.5">
              <label htmlFor="new-cat-name" className="block text-sm font-medium text-[#8F454B]">
                Tambah Kategori Baru
              </label>
              <input
                id="new-cat-name"
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Contoh: Party Makeup"
                className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={savingCategory}
              className="inline-flex items-center gap-2 rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-5 py-2.5 text-sm font-medium shrink-0 disabled:opacity-60"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Tambah Kategori</span>
            </button>
          </form>

          <div className="space-y-3">
            {bundle.categories.map((cat, idx) => {
              const count = bundle.portfolioItems.filter((p) => p.category_id === cat.id).length;
              const isEditingThis = editingCat?.id === cat.id;

              return (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  {isEditingThis ? (
                    <form
                      onSubmit={handleSaveRenameCategory}
                      className="flex-1 flex flex-wrap items-center gap-2"
                    >
                      <input
                        type="text"
                        required
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="flex-1 min-w-[200px] rounded-xl border border-[#B96B78]/35 bg-white px-3 py-1.5 text-sm"
                      />
                      <button
                        type="submit"
                        disabled={savingCategory}
                        className="rounded-full bg-[#B96B78] text-white px-4 py-1.5 text-xs font-medium"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCat(null)}
                        className="rounded-full border border-[#B96B78]/30 px-3 py-1.5 text-xs"
                      >
                        Batal
                      </button>
                    </form>
                  ) : (
                    <div>
                      <p className="font-serif text-xl text-[#8F454B]">{cat.name}</p>
                      <p className="text-xs text-[#594448]/75">{count} foto terhubung</p>
                    </div>
                  )}

                  {!isEditingThis && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void handleMoveCategory(idx, -1)}
                        disabled={idx === 0}
                        className="p-2 rounded-lg border border-[#B96B78]/20 disabled:opacity-35"
                        aria-label="Naikkan kategori"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleMoveCategory(idx, 1)}
                        disabled={idx === bundle.categories.length - 1}
                        className="p-2 rounded-lg border border-[#B96B78]/20 disabled:opacity-35"
                        aria-label="Turunkan kategori"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCat(cat);
                          setEditingCatName(cat.name);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#B96B78]/30 px-3 py-1.5 text-xs font-medium text-[#8F454B]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Ubah Nama</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteCategoryModal(cat)}
                        className="p-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
                        aria-label={`Hapus kategori ${cat.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Edit 1 Foto (2 Tab: Atur Frame Galeri & Atur Detail Lightbox) */}
      {editingItem && (() => {
        const autoFrame = detectPortfolioFrameShape(editingItem.id, bundle.portfolioItems);
        const currentPhotoUrl =
          editPendingUrl ??
          (editingItem.media_id
            ? (bundle.mediaUrls[editingItem.media_id] ?? null)
            : editingItem.fallback_demo_url);
        const activeCategoryName =
          bundle.categories.find((c) => c.id === editCatId)?.name ?? 'Portofolio';

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3d282c]/45 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
          >
            <form
              onSubmit={handleSaveEditedPhoto}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFF9F5] border border-[#B96B78]/25 p-6 space-y-5 shadow-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-[#8F454B]">Edit Foto Portofolio</h2>
                  <p className="text-xs text-[#594448]/75 mt-0.5">
                    Posisi saat ini di galeri memakai bingkai{' '}
                    <strong className="text-[#8F454B]">{autoFrame.label}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1.5 rounded-full hover:bg-[#F8E6EB]"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2 Tab Pengaturan: Frame Galeri vs Detail Lightbox */}
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#B96B78]/20 bg-[#F8E6EB]/35 p-1.5">
                <button
                  type="button"
                  onClick={() => setEditModalTab('frame')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    editModalTab === 'frame'
                      ? 'bg-[#B96B78] text-white shadow-xs'
                      : 'text-[#594448] hover:bg-white/70'
                  }`}
                >
                  <Crop className="w-4 h-4" />
                  <span>1. Atur Frame Galeri</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalTab('detail')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    editModalTab === 'detail'
                      ? 'bg-[#B96B78] text-white shadow-xs'
                      : 'text-[#594448] hover:bg-white/70'
                  }`}
                >
                  <Expand className="w-4 h-4" />
                  <span>2. Atur Detail (Lightbox)</span>
                </button>
              </div>

              {editModalTab === 'frame' ? (
                <div className="space-y-4">
                  {/* Pemilih Simulasi Bentuk Bingkai (Persegi Panjang / Persegi / Potret) */}
                  <div className="rounded-2xl border border-[#B96B78]/18 bg-white/80 p-3.5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#8F454B]">
                        Simulasi Bentuk Bingkai di Website:
                      </span>
                      <span className="text-[11px] text-[#594448]/70">
                        Cek potongan di bingkai persegi panjang maupun persegi
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { mode: 'wide' as const, label: 'Persegi Panjang' },
                          { mode: 'square' as const, label: 'Persegi' },
                          { mode: 'portrait' as const, label: 'Potret (4:5)' },
                        ] as const
                      ).map((opt) => {
                        const isSelected = editFramePreview === opt.mode;
                        const isAuto = autoFrame.mode === opt.mode;
                        return (
                          <button
                            key={opt.mode}
                            type="button"
                            onClick={() => setEditFramePreview(opt.mode)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#B96B78] border-[#B96B78] text-white'
                                : 'bg-[#FFF9F5] border-[#B96B78]/25 text-[#594448] hover:bg-[#F8E6EB]/60'
                            }`}
                          >
                            {opt.label}
                            {isAuto ? ' (Aktif)' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <ImageUploadField
                    label="Foto & Pengaturan Posisi dalam Bingkai"
                    hint="Seret langsung foto atau atur zoom agar wajah/riasan pas dengan bentuk bingkai galeri."
                    recommendedSize="1000 × 800 px (persegi panjang) atau 900 × 900 px (persegi)"
                    currentUrl={
                      editingItem.media_id
                        ? (bundle.mediaUrls[editingItem.media_id] ?? null)
                        : editingItem.fallback_demo_url
                    }
                    pendingFile={editPendingFile}
                    onSelectFile={setEditPendingFile}
                    aspectMode={editFramePreview}
                    showFocusPicker
                    focusX={editFocusX}
                    focusY={editFocusY}
                    onChangeFocus={(x, y) => {
                      setEditFocusX(x);
                      setEditFocusY(y);
                    }}
                    zoom={editZoom}
                    onChangeZoom={setEditZoom}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Live Preview Detail Lightbox (Persis saat foto diklik di website) */}
                  <div className="rounded-2xl border border-[#B96B78]/25 bg-[#2c1d20] p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#FFF9F5]/75">
                      <span>Preview Tampilan Detail Saat Foto Diklik</span>
                      <span>Lightbox</span>
                    </div>
                    <div className="relative w-full aspect-[4/3] max-h-[260px] mx-auto overflow-hidden rounded-xl bg-[#24171a]">
                      <SmartImage
                        src={currentPhotoUrl}
                        alt={editAlt || editTitle}
                        focusX={editFocusX}
                        focusY={editFocusY}
                        loading="eager"
                        className="w-full h-full object-contain bg-[#24171a]"
                      />
                    </div>
                    <div className="text-center text-[#FFF9F5] space-y-0.5">
                      <p className="font-serif text-lg sm:text-xl">
                        <FormattedText text={editTitle || 'Judul Foto'} />
                      </p>
                      <p className="text-[11px] tracking-wider uppercase opacity-75">
                        {activeCategoryName}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#8F454B]">Judul Foto</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
                    />
                    <TextFormatHint />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#8F454B]">
                      Alt Text (Deskripsi Foto untuk SEO)
                    </label>
                    <input
                      type="text"
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[#8F454B]">Kategori</label>
                      <select
                        value={editCatId}
                        onChange={(e) => setEditCatId(e.target.value)}
                        className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
                      >
                        {bundle.categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-2.5 pt-5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editVisible}
                        onChange={(e) => setEditVisible(e.target.checked)}
                        className="accent-[#B96B78] w-4 h-4"
                      />
                      <span>Tampilkan di galeri</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-[#B96B78]/15">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-full border border-[#B96B78]/30 px-5 py-2 text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-full bg-[#B96B78] text-white px-5 py-2 text-sm font-medium disabled:opacity-60"
                >
                  {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        );
      })()}

      {/* Dialog Hapus Foto */}
      <ConfirmDialog
        open={Boolean(deletePhotoTarget)}
        title="Hapus Foto Portofolio?"
        description={`Yakin ingin menghapus foto "${deletePhotoTarget?.title ?? ''}" dari draft?`}
        confirmLabel="Ya, Hapus"
        tone="danger"
        loading={deletingPhoto}
        onConfirm={() => void handleDeletePhoto()}
        onCancel={() => setDeletePhotoTarget(null)}
      />

      {/* Dialog Hapus Kategori (dengan pemindahan foto bila masih dipakai) */}
      <ConfirmDialog
        open={Boolean(deleteCatTarget)}
        title={`Hapus Kategori "${deleteCatTarget?.name ?? ''}"?`}
        description={
          deleteCatUsageCount > 0 ? (
            otherCategories.length > 0 ? (
              <div className="space-y-3">
                <p>
                  Kategori ini masih digunakan oleh <strong>{deleteCatUsageCount} foto</strong>.
                  Pilih kategori tujuan untuk memindahkan foto-foto tersebut sebelum kategori ini
                  dihapus:
                </p>
                <select
                  value={reassignCatId}
                  onChange={(e) => setReassignCatId(e.target.value)}
                  className="w-full rounded-xl border border-[#B96B78]/30 bg-white px-3 py-2 text-sm"
                >
                  {otherCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      Pindahkan ke: {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-rose-700">
                Kategori ini masih digunakan oleh {deleteCatUsageCount} foto dan belum ada kategori
                pengganti. Buat kategori baru terlebih dahulu atau hapus fotonya sebelum menghapus
                kategori ini.
              </p>
            )
          ) : (
            <p>Kategori ini tidak memiliki foto. Yakin ingin menghapusnya?</p>
          )
        }
        confirmLabel={
          deleteCatUsageCount > 0 && otherCategories.length === 0
            ? 'Tidak Dapat Dihapus'
            : 'Ya, Hapus Kategori'
        }
        tone="danger"
        loading={deletingCat}
        onConfirm={() => {
          if (deleteCatUsageCount > 0 && otherCategories.length === 0) {
            setDeleteCatTarget(null);
            return;
          }
          void handleConfirmDeleteCategory();
        }}
        onCancel={() => setDeleteCatTarget(null)}
      />
    </div>
  );
}
