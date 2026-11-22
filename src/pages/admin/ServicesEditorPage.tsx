import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  FolderPlus,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { AdminFormBar } from '../../components/admin/AdminFormBar';
import { useAdminCms } from '../../components/admin/AdminContext';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { TextFormatHint } from '../../components/admin/TextFormatHint';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SmartImage } from '../../components/common/SmartImage';
import { useToast } from '../../components/common/ToastProvider';
import {
  deleteService,
  deleteServiceCategoryWithReassign,
  reorderServiceCategories,
  reorderServices,
  updateSiteSettings,
  upsertService,
  upsertServiceCategory,
} from '../../lib/cmsService';
import { uploadDraftImage } from '../../lib/media';
import { DEFAULT_SITE_COPY } from '../../lib/defaults';
import type { ServiceCategory, ServiceItem } from '../../types/cms';

interface ServiceFormState {
  id?: string;
  category_id: string | null;
  name: string;
  short_description: string;
  detail_description: string;
  highlights: string[];
  price_label: string;
  media_id: string | null;
  fallback_demo_url: string | null;
  image_alt: string;
  image_focus_x: number;
  image_focus_y: number;
  image_zoom: number;
  is_visible: boolean;
}

function emptyServiceForm(defaultCategoryId: string | null): ServiceFormState {
  return {
    category_id: defaultCategoryId,
    name: '',
    short_description: '',
    detail_description: '',
    highlights: [''],
    price_label: '',
    media_id: null,
    fallback_demo_url: null,
    image_alt: '',
    image_focus_x: 50,
    image_focus_y: 30,
    image_zoom: 100,
    is_visible: true,
  };
}

export function ServicesEditorPage() {
  const { bundle, reloadBundle } = useAdminCms();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [filterCatId, setFilterCatId] = useState<string>('all');

  // Judul & subjudul bagian Layanan
  const [sectionEyebrow, setSectionEyebrow] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [savingHeading, setSavingHeading] = useState(false);
  const [headingError, setHeadingError] = useState<string | null>(null);
  const [headingSuccess, setHeadingSuccess] = useState<string | null>(null);

  // Modal / form edit item layanan
  const [editingForm, setEditingForm] = useState<ServiceFormState | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [savingItem, setSavingItem] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);

  // Hapus layanan
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Kategori layanan
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingCat, setEditingCat] = useState<ServiceCategory | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [deleteCatTarget, setDeleteCatTarget] = useState<ServiceCategory | null>(null);
  const [reassignCatId, setReassignCatId] = useState<string>('none');
  const [deletingCat, setDeletingCat] = useState(false);

  useEffect(() => {
    if (!bundle) return;
    const copy = bundle.settings.site_copy ?? DEFAULT_SITE_COPY;
    setSectionEyebrow(copy.services_eyebrow);
    setSectionTitle(bundle.settings.services_title);
    setSectionSubtitle(bundle.settings.services_subtitle);
  }, [bundle]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of bundle?.serviceCategories ?? []) {
      map[c.id] = c.name;
    }
    return map;
  }, [bundle?.serviceCategories]);

  if (!bundle) return null;
  const currentCopy = bundle.settings.site_copy ?? DEFAULT_SITE_COPY;

  const isHeadingDirty =
    sectionEyebrow !== currentCopy.services_eyebrow ||
    sectionTitle !== bundle.settings.services_title ||
    sectionSubtitle !== bundle.settings.services_subtitle ||
    editingForm !== null;

  const filteredServices =
    filterCatId === 'all'
      ? bundle.services
      : bundle.services.filter((s) => s.category_id === filterCatId);

  const handleSaveHeading = async (e: FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) {
      setHeadingError('Judul bagian Layanan wajib diisi.');
      return;
    }
    setSavingHeading(true);
    setHeadingError(null);
    setHeadingSuccess(null);
    try {
      await updateSiteSettings({
        services_title: sectionTitle.trim(),
        services_subtitle: sectionSubtitle.trim(),
        site_copy: {
          services_eyebrow: sectionEyebrow.trim() || 'Curated Services',
        },
      });
      await reloadBundle();
      setHeadingSuccess('Judul bagian Layanan disimpan ke draft.');
      showToast('Judul bagian Layanan tersimpan.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan judul layanan.';
      setHeadingError(msg);
      showToast(msg, 'error');
    } finally {
      setSavingHeading(false);
    }
  };

  const openEditModal = (item?: ServiceItem) => {
    setItemError(null);
    setPendingFile(null);
    if (!item) {
      const defaultCat =
        filterCatId !== 'all' ? filterCatId : (bundle.serviceCategories[0]?.id ?? null);
      setEditingForm(emptyServiceForm(defaultCat));
      return;
    }
    setEditingForm({
      id: item.id,
      category_id: item.category_id ?? null,
      name: item.name,
      short_description: item.short_description,
      detail_description: item.detail_description,
      highlights: item.highlights?.length ? [...item.highlights] : [''],
      price_label: item.price_label,
      media_id: item.media_id,
      fallback_demo_url: item.fallback_demo_url,
      image_alt: item.image_alt,
      image_focus_x: item.image_focus_x,
      image_focus_y: item.image_focus_y,
      image_zoom: item.image_zoom ?? 100,
      is_visible: item.is_visible,
    });
  };

  const handleSaveItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingForm) return;
    if (!editingForm.name.trim()) {
      setItemError('Nama layanan wajib diisi.');
      return;
    }

    setSavingItem(true);
    setItemError(null);
    try {
      let nextMediaId = editingForm.media_id;
      let nextDemoUrl = editingForm.fallback_demo_url;
      if (pendingFile) {
        const asset = await uploadDraftImage(
          pendingFile,
          'services',
          editingForm.image_alt || editingForm.name
        );
        nextMediaId = asset.id;
        nextDemoUrl = null;
      }

      const sortOrder = editingForm.id
        ? (bundle.services.find((s) => s.id === editingForm.id)?.sort_order ?? 1)
        : (bundle.services[bundle.services.length - 1]?.sort_order ?? 0) + 1;

      const cleanedHighlights = editingForm.highlights
        .map((h) => h.trim())
        .filter(Boolean);

      await upsertService({
        id: editingForm.id,
        category_id: editingForm.category_id || null,
        name: editingForm.name.trim(),
        short_description: editingForm.short_description.trim(),
        detail_description: editingForm.detail_description.trim(),
        highlights: cleanedHighlights,
        price_label: editingForm.price_label.trim(),
        media_id: nextMediaId,
        fallback_demo_url: nextDemoUrl,
        image_alt: editingForm.image_alt.trim() || editingForm.name.trim(),
        image_focus_x: editingForm.image_focus_x,
        image_focus_y: editingForm.image_focus_y,
        image_zoom: editingForm.image_zoom,
        sort_order: sortOrder,
        is_visible: editingForm.is_visible,
      });

      await reloadBundle();
      setEditingForm(null);
      setPendingFile(null);
      showToast('Layanan berhasil disimpan ke draft.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan layanan.';
      setItemError(msg);
      showToast(msg, 'error');
    } finally {
      setSavingItem(false);
    }
  };

  const handleToggleVisibility = async (item: ServiceItem) => {
    try {
      await upsertService({
        id: item.id,
        name: item.name,
        is_visible: !item.is_visible,
      });
      await reloadBundle();
      showToast(
        !item.is_visible ? 'Layanan ditampilkan di draft.' : 'Layanan disembunyikan di draft.',
        'info'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah status tampil.', 'error');
    }
  };

  const handleMove = async (item: ServiceItem, direction: -1 | 1) => {
    const ids = bundle.services.map((s) => s.id);
    const index = ids.indexOf(item.id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= ids.length) return;
    const [moved] = ids.splice(index, 1);
    ids.splice(targetIndex, 0, moved);
    try {
      await reorderServices(ids);
      await reloadBundle();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah urutan.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteService(deleteTarget.id);
      await reloadBundle();
      setDeleteTarget(null);
      showToast('Layanan dihapus dari draft.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus layanan.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Handler Kategori Layanan
  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    try {
      const nextOrder =
        (bundle.serviceCategories[bundle.serviceCategories.length - 1]?.sort_order ?? 0) + 1;
      await upsertServiceCategory({ name: newCategoryName.trim(), sort_order: nextOrder });
      setNewCategoryName('');
      await reloadBundle();
      showToast('Kategori layanan baru ditambahkan ke draft.', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Gagal menambahkan kategori layanan.',
        'error'
      );
    } finally {
      setSavingCategory(false);
    }
  };

  const handleSaveRenameCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCatName.trim()) return;
    setSavingCategory(true);
    try {
      await upsertServiceCategory({ id: editingCat.id, name: editingCatName.trim() });
      setEditingCat(null);
      await reloadBundle();
      showToast('Nama kategori layanan diperbarui.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah kategori layanan.', 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleMoveCategory = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= bundle.serviceCategories.length) return;
    const ids = bundle.serviceCategories.map((c) => c.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(targetIdx, 0, moved);
    try {
      await reorderServiceCategories(ids);
      await reloadBundle();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengurutkan kategori.', 'error');
    }
  };

  const openDeleteCategoryModal = (cat: ServiceCategory) => {
    setDeleteCatTarget(cat);
    const fallback = bundle.serviceCategories.find((c) => c.id !== cat.id);
    setReassignCatId(fallback?.id ?? 'none');
  };

  const deleteCatUsageCount = deleteCatTarget
    ? bundle.services.filter((s) => s.category_id === deleteCatTarget.id).length
    : 0;

  const otherCategories = deleteCatTarget
    ? bundle.serviceCategories.filter((c) => c.id !== deleteCatTarget.id)
    : [];

  const handleConfirmDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    setDeletingCat(true);
    try {
      const target =
        deleteCatUsageCount > 0 && reassignCatId !== 'none' ? reassignCatId : null;
      await deleteServiceCategoryWithReassign(deleteCatTarget.id, target);
      await reloadBundle();
      setDeleteCatTarget(null);
      showToast('Kategori layanan berhasil dihapus dari draft.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus kategori layanan.', 'error');
    } finally {
      setDeletingCat(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#8F454B]">Layanan &amp; Kategori</h1>
          <p className="text-sm text-[#594448]/80 mt-1">
            Kelola kategori layanan, daftar paket makeup, rincian isian paket, dan foto tiap
            layanan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-[#B96B78]/25 bg-[#FFF9F5] p-1">
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'services' ? 'bg-[#B96B78] text-white' : 'text-[#594448]'
              }`}
            >
              Daftar Layanan ({bundle.services.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'categories' ? 'bg-[#B96B78] text-white' : 'text-[#594448]'
              }`}
            >
              Kategori ({bundle.serviceCategories.length})
            </button>
          </div>

          {activeTab === 'services' && (
            <button
              type="button"
              onClick={() => openEditModal()}
              className="inline-flex items-center gap-2 rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-5 py-2.5 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Layanan</span>
            </button>
          )}
        </div>
      </div>

      {/* Pengaturan Judul Bagian Layanan */}
      <form
        onSubmit={handleSaveHeading}
        className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-6 space-y-4"
      >
        <h2 className="font-serif text-xl text-[#8F454B]">Judul &amp; Subjudul Bagian</h2>
        <TextFormatHint />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="svc-sec-eyebrow" className="block text-sm font-medium text-[#8F454B]">
              Label Kecil Atas
            </label>
            <input
              id="svc-sec-eyebrow"
              type="text"
              value={sectionEyebrow}
              onChange={(e) => setSectionEyebrow(e.target.value)}
              placeholder="Curated Services"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="svc-sec-title" className="block text-sm font-medium text-[#8F454B]">
              Judul Bagian
            </label>
            <input
              id="svc-sec-title"
              type="text"
              required
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="svc-sec-sub" className="block text-sm font-medium text-[#8F454B]">
              Subjudul Singkat
            </label>
            <input
              id="svc-sec-sub"
              type="text"
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
            />
          </div>
        </div>

        <AdminFormBar
          isDirty={isHeadingDirty}
          saving={savingHeading}
          saveError={headingError}
          saveSuccess={headingSuccess}
          saveLabel="Simpan Judul Bagian"
        />
      </form>

      {activeTab === 'services' ? (
        <div className="space-y-4">
          {/* Filter Kategori */}
          {bundle.serviceCategories.length > 0 && (
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
                Semua ({bundle.services.length})
              </button>
              {bundle.serviceCategories.map((cat) => (
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
          )}

          {/* Daftar Layanan */}
          <div className="space-y-3">
            {filteredServices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#B96B78]/30 bg-[#FFF9F5] p-8 text-center text-sm text-[#594448]/80">
                Belum ada layanan pada filter ini. Klik tombol <strong>Tambah Layanan</strong> untuk
                menambahkan.
              </div>
            ) : (
              filteredServices.map((item) => {
                const imgUrl = item.media_id
                  ? (bundle.mediaUrls[item.media_id] ?? null)
                  : item.fallback_demo_url;
                const globalIdx = bundle.services.findIndex((s) => s.id === item.id);
                const catName = item.category_id ? categoryMap[item.category_id] : null;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="w-20 aspect-[4/5] rounded-xl overflow-hidden shrink-0 bg-[#F8E6EB]">
                      <SmartImage
                        src={imgUrl}
                        alt={item.image_alt || item.name}
                        focusX={item.image_focus_x}
                        focusY={item.image_focus_y}
                        zoom={item.image_zoom ?? 100}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {catName && (
                          <span className="rounded-full border border-[#B96B78]/30 bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#B96B78]">
                            {catName}
                          </span>
                        )}
                        <h3 className="font-serif text-xl text-[#8F454B]">{item.name}</h3>
                        {item.price_label && (
                          <span className="rounded-full bg-[#F8E6EB] px-2.5 py-0.5 text-xs font-medium text-[#8F454B]">
                            {item.price_label}
                          </span>
                        )}
                        {!item.is_visible && (
                          <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs text-stone-700">
                            Disembunyikan
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[#594448]/85 line-clamp-2">
                        {item.short_description}
                      </p>
                      {item.highlights?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                          {item.highlights.slice(0, 3).map((h, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs text-[#594448]/75"
                            >
                              <Check className="w-3 h-3 text-[#B96B78]" />
                              <span>{h}</span>
                            </span>
                          ))}
                          {item.highlights.length > 3 && (
                            <span className="text-xs text-[#B96B78]">
                              +{item.highlights.length - 3} isian lainnya
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => void handleMove(item, -1)}
                        disabled={globalIdx <= 0}
                        className="p-2 rounded-lg border border-[#B96B78]/20 text-[#594448] hover:bg-[#F8E6EB]/60 disabled:opacity-35"
                        aria-label={`Naikkan urutan ${item.name}`}
                        title="Naikkan urutan"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleMove(item, 1)}
                        disabled={globalIdx >= bundle.services.length - 1}
                        className="p-2 rounded-lg border border-[#B96B78]/20 text-[#594448] hover:bg-[#F8E6EB]/60 disabled:opacity-35"
                        aria-label={`Turunkan urutan ${item.name}`}
                        title="Turunkan urutan"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleVisibility(item)}
                        className="p-2 rounded-lg border border-[#B96B78]/20 text-[#594448] hover:bg-[#F8E6EB]/60"
                        aria-label={item.is_visible ? 'Sembunyikan layanan' : 'Tampilkan layanan'}
                        title={item.is_visible ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {item.is_visible ? (
                          <Eye className="w-4 h-4 text-[#B96B78]" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-stone-400" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#B96B78]/30 px-3 py-1.5 text-xs font-medium text-[#8F454B] hover:bg-[#F8E6EB]/60"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="p-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
                        aria-label={`Hapus ${item.name}`}
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Tab Kategori Layanan */
        <div className="space-y-5">
          <form
            onSubmit={handleAddCategory}
            className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 flex flex-col sm:flex-row gap-3 items-end"
          >
            <div className="flex-1 w-full space-y-1.5">
              <label
                htmlFor="new-svc-cat-name"
                className="block text-sm font-medium text-[#8F454B]"
              >
                Tambah Kategori Layanan Baru
              </label>
              <input
                id="new-svc-cat-name"
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Contoh: Party & Bridesmaid"
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
            {bundle.serviceCategories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#B96B78]/30 bg-[#FFF9F5] p-8 text-center text-sm text-[#594448]/75">
                Belum ada kategori layanan. Tambahkan kategori baru di atas.
              </div>
            ) : (
              bundle.serviceCategories.map((cat, idx) => {
                const count = bundle.services.filter((s) => s.category_id === cat.id).length;
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
                        <p className="text-xs text-[#594448]/75">{count} layanan terhubung</p>
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
                          disabled={idx === bundle.serviceCategories.length - 1}
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
              })
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Layanan */}
      {editingForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3d282c]/45 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveItem}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFF9F5] border border-[#B96B78]/25 p-6 sm:p-7 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl text-[#8F454B]">
                {editingForm.id ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingForm(null)}
                className="p-1.5 rounded-full hover:bg-[#F8E6EB] text-[#594448]"
                aria-label="Tutup form layanan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {itemError && (
              <p className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-sm text-rose-800">
                {itemError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#8F454B]">
                  Kategori Layanan
                </label>
                <select
                  value={editingForm.category_id ?? ''}
                  onChange={(e) =>
                    setEditingForm({
                      ...editingForm,
                      category_id: e.target.value || null,
                    })
                  }
                  className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
                >
                  <option value="">Tanpa Kategori</option>
                  {bundle.serviceCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#8F454B]">Nama Layanan</label>
                <input
                  type="text"
                  required
                  value={editingForm.name}
                  onChange={(e) => setEditingForm({ ...editingForm, name: e.target.value })}
                  placeholder="Contoh: Bridal Makeup"
                  className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#8F454B]">
                  Harga (Opsional)
                </label>
                <input
                  type="text"
                  value={editingForm.price_label}
                  onChange={(e) => setEditingForm({ ...editingForm, price_label: e.target.value })}
                  placeholder="Misal: Mulai Rp 1.5 jt"
                  className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#8F454B]">Deskripsi Singkat</label>
              <textarea
                rows={2}
                value={editingForm.short_description}
                onChange={(e) =>
                  setEditingForm({ ...editingForm, short_description: e.target.value })
                }
                placeholder="Ringkasan yang tampil pada kartu layanan"
                className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#8F454B]">Detail Layanan</label>
              <textarea
                rows={3}
                value={editingForm.detail_description}
                onChange={(e) =>
                  setEditingForm({ ...editingForm, detail_description: e.target.value })
                }
                placeholder="Penjelasan lengkap saat pengunjung mengklik kartu layanan..."
                className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
              />
            </div>

            {/* Isian / Rincian Paket Layanan */}
            <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FAF6F4] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="block text-sm font-medium text-[#8F454B]">
                    Isian / Rincian Paket Layanan
                  </span>
                  <span className="text-xs text-[#594448]/75">
                    Daftar poin yang didapat pelanggan (tampil di kartu dan modal detail).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingForm({
                      ...editingForm,
                      highlights: [...editingForm.highlights, ''],
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-white border border-[#B96B78]/35 px-3 py-1 text-xs font-medium text-[#8F454B] hover:bg-[#F8E6EB]/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Isian</span>
                </button>
              </div>

              <div className="space-y-2">
                {editingForm.highlights.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const next = [...editingForm.highlights];
                        next[idx] = e.target.value;
                        setEditingForm({ ...editingForm, highlights: next });
                      }}
                      placeholder={`Poin isian ${idx + 1} (contoh: Free bulu mata natural & touch-up)`}
                      className="flex-1 rounded-xl border border-[#B96B78]/25 bg-white px-3 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = editingForm.highlights.filter((_, i) => i !== idx);
                        setEditingForm({
                          ...editingForm,
                          highlights: next.length ? next : [''],
                        });
                      }}
                      className="p-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
                      aria-label="Hapus poin isian"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <ImageUploadField
              label="Foto Layanan"
              recommendedSize="800 × 1000 px (rasio 4:5 vertikal)"
              currentUrl={
                editingForm.media_id
                  ? (bundle.mediaUrls[editingForm.media_id] ?? null)
                  : editingForm.fallback_demo_url
              }
              pendingFile={pendingFile}
              onSelectFile={setPendingFile}
              aspectMode="portrait"
              showFocusPicker
              focusX={editingForm.image_focus_x}
              focusY={editingForm.image_focus_y}
              onChangeFocus={(x, y) =>
                setEditingForm({ ...editingForm, image_focus_x: x, image_focus_y: y })
              }
              zoom={editingForm.image_zoom}
              onChangeZoom={(z) => setEditingForm({ ...editingForm, image_zoom: z })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#8F454B]">Alt Text Foto</label>
                <input
                  type="text"
                  value={editingForm.image_alt}
                  onChange={(e) => setEditingForm({ ...editingForm, image_alt: e.target.value })}
                  placeholder="Deskripsi singkat foto layanan"
                  className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
                />
              </div>

              <label className="flex items-center gap-2.5 pt-5 text-sm text-[#594448] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingForm.is_visible}
                  onChange={(e) =>
                    setEditingForm({ ...editingForm, is_visible: e.target.checked })
                  }
                  className="accent-[#B96B78] w-4 h-4"
                />
                <span>Tampilkan layanan ini saat dipublikasikan</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#B96B78]/15">
              <button
                type="button"
                onClick={() => setEditingForm(null)}
                disabled={savingItem}
                className="rounded-full border border-[#B96B78]/30 px-5 py-2 text-sm font-medium text-[#594448]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingItem}
                className="inline-flex items-center gap-2 rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-5 py-2 text-sm font-medium disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{savingItem ? 'Menyimpan...' : 'Simpan Layanan'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Layanan?"
        description={`Yakin ingin menghapus layanan "${deleteTarget?.name ?? ''}" dari draft?`}
        confirmLabel="Ya, Hapus"
        tone="danger"
        loading={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteCatTarget)}
        title={`Hapus Kategori "${deleteCatTarget?.name ?? ''}"?`}
        description={
          deleteCatUsageCount > 0 ? (
            <div className="space-y-3">
              <p>
                Kategori ini masih dipakai oleh <strong>{deleteCatUsageCount} layanan</strong>.
                Pilih tindakan untuk layanan tersebut sebelum kategori dihapus:
              </p>
              <select
                value={reassignCatId}
                onChange={(e) => setReassignCatId(e.target.value)}
                className="w-full rounded-xl border border-[#B96B78]/30 bg-white px-3 py-2 text-sm"
              >
                <option value="none">Lepas kategori (ubah ke Tanpa Kategori)</option>
                {otherCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    Pindahkan ke kategori: {cat.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p>Kategori ini belum terhubung ke layanan mana pun. Yakin ingin menghapusnya?</p>
          )
        }
        confirmLabel="Ya, Hapus Kategori"
        tone="danger"
        loading={deletingCat}
        onConfirm={() => void handleConfirmDeleteCategory()}
        onCancel={() => setDeleteCatTarget(null)}
      />
    </div>
  );
}
