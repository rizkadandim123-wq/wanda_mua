import { useEffect, useState, type FormEvent } from 'react';
import { AdminFormBar } from '../../components/admin/AdminFormBar';
import { useAdminCms } from '../../components/admin/AdminContext';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { TextFormatHint } from '../../components/admin/TextFormatHint';
import { useToast } from '../../components/common/ToastProvider';
import { updateSiteSettings } from '../../lib/cmsService';
import { DEFAULT_SITE_COPY } from '../../lib/defaults';
import { uploadDraftImage } from '../../lib/media';

export function AboutEditorPage() {
  const { bundle, reloadBundle } = useAdminCms();
  const { showToast } = useToast();

  const [aboutEyebrow, setAboutEyebrow] = useState('');
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');
  const [aboutServiceArea, setAboutServiceArea] = useState('');
  const [aboutMediaId, setAboutMediaId] = useState<string | null>(null);
  const [aboutDemoUrl, setAboutDemoUrl] = useState<string | null>(null);
  const [aboutMediaAlt, setAboutMediaAlt] = useState('');
  const [aboutFocusX, setAboutFocusX] = useState(50);
  const [aboutFocusY, setAboutFocusY] = useState(45);
  const [aboutZoom, setAboutZoom] = useState(100);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!bundle) return;
    const s = bundle.settings;
    const copy = s.site_copy ?? DEFAULT_SITE_COPY;
    setAboutEyebrow(copy.about_eyebrow);
    setAboutTitle(s.about_title);
    setAboutDescription(s.about_description);
    setAboutServiceArea(s.about_service_area);
    setAboutMediaId(s.about_media_id);
    setAboutDemoUrl(s.about_demo_url);
    setAboutMediaAlt(s.about_media_alt);
    setAboutFocusX(s.about_media_focus_x);
    setAboutFocusY(s.about_media_focus_y);
    setAboutZoom(s.about_media_zoom ?? 100);
    setPendingFile(null);
  }, [bundle]);

  if (!bundle) return null;
  const s = bundle.settings;
  const copy = s.site_copy ?? DEFAULT_SITE_COPY;

  const isDirty =
    aboutEyebrow !== copy.about_eyebrow ||
    aboutTitle !== s.about_title ||
    aboutDescription !== s.about_description ||
    aboutServiceArea !== s.about_service_area ||
    aboutMediaId !== s.about_media_id ||
    aboutDemoUrl !== s.about_demo_url ||
    aboutMediaAlt !== s.about_media_alt ||
    aboutFocusX !== s.about_media_focus_x ||
    aboutFocusY !== s.about_media_focus_y ||
    aboutZoom !== (s.about_media_zoom ?? 100) ||
    pendingFile !== null;

  const currentUrl = aboutMediaId ? (bundle.mediaUrls[aboutMediaId] ?? null) : aboutDemoUrl;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!aboutTitle.trim()) {
      setSaveError('Judul bagian Tentang wajib diisi.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      let nextMediaId = aboutMediaId;
      let nextDemoUrl = aboutDemoUrl;
      if (pendingFile) {
        const asset = await uploadDraftImage(pendingFile, 'about', aboutMediaAlt);
        nextMediaId = asset.id;
        nextDemoUrl = null;
      }

      await updateSiteSettings({
        about_title: aboutTitle.trim(),
        about_description: aboutDescription.trim(),
        about_service_area: aboutServiceArea.trim(),
        about_media_id: nextMediaId,
        about_demo_url: nextDemoUrl,
        about_media_alt: aboutMediaAlt.trim(),
        about_media_focus_x: aboutFocusX,
        about_media_focus_y: aboutFocusY,
        about_media_zoom: aboutZoom,
        site_copy: {
          about_eyebrow: aboutEyebrow.trim() || 'Tentang Kami',
        },
      });

      await reloadBundle();
      setSaveSuccess('Bagian Tentang berhasil disimpan sebagai draft.');
      showToast('Bagian Tentang tersimpan ke draft.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan bagian Tentang.';
      setSaveError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#8F454B]">Tentang Bisnis</h1>
        <p className="text-sm text-[#594448]/80 mt-1">
          Ceritakan pendekatan makeup dan area layanan Anda secara jujur dan personal.
        </p>
      </div>

      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="about-eyebrow" className="block text-sm font-medium text-[#8F454B]">
            Label Kecil Atas (Eyebrow)
          </label>
          <input
            id="about-eyebrow"
            type="text"
            value={aboutEyebrow}
            onChange={(e) => setAboutEyebrow(e.target.value)}
            placeholder="Tentang Kami"
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="about-title" className="block text-sm font-medium text-[#8F454B]">
            Judul Bagian Tentang
          </label>
          <input
            id="about-title"
            type="text"
            required
            value={aboutTitle}
            onChange={(e) => setAboutTitle(e.target.value)}
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
          />
          <TextFormatHint />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="about-desc" className="block text-sm font-medium text-[#8F454B]">
            Deskripsi Bisnis &amp; Pendekatan Makeup
          </label>
          <textarea
            id="about-desc"
            rows={6}
            value={aboutDescription}
            onChange={(e) => setAboutDescription(e.target.value)}
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
          />
          <p className="text-xs text-[#594448]/75">
            Pisahkan paragraf dengan baris kosong (Enter dua kali).
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="about-area" className="block text-sm font-medium text-[#8F454B]">
            Area Layanan / Lokasi (Opsional)
          </label>
          <input
            id="about-area"
            type="text"
            value={aboutServiceArea}
            onChange={(e) => setAboutServiceArea(e.target.value)}
            placeholder="Contoh: Denpasar, Badung, & sekitarnya (kosongkan jika belum ingin tampil)"
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-4">
        <ImageUploadField
          label="Foto Makeup Artist / Suasana Kerja"
          hint="Unggah foto diri makeup artist atau perlengkapan rias profesional Anda."
          recommendedSize="800 × 1000 px (rasio 4:5 vertikal)"
          currentUrl={currentUrl}
          pendingFile={pendingFile}
          onSelectFile={setPendingFile}
          aspectMode="portrait"
          showFocusPicker
          focusX={aboutFocusX}
          focusY={aboutFocusY}
          onChangeFocus={(x, y) => {
            setAboutFocusX(x);
            setAboutFocusY(y);
          }}
          zoom={aboutZoom}
          onChangeZoom={setAboutZoom}
        />

        <div className="space-y-1.5">
          <label htmlFor="about-alt" className="block text-sm font-medium text-[#8F454B]">
            Alt Text Foto
          </label>
          <input
            id="about-alt"
            type="text"
            value={aboutMediaAlt}
            onChange={(e) => setAboutMediaAlt(e.target.value)}
            placeholder="Deskripsi singkat foto bagian Tentang"
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
          />
        </div>
      </div>

      <AdminFormBar
        isDirty={isDirty}
        saving={saving}
        saveError={saveError}
        saveSuccess={saveSuccess}
      />
    </form>
  );
}
