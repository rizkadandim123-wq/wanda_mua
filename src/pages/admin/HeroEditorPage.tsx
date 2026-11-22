import { useEffect, useState, type FormEvent } from 'react';
import { AdminFormBar } from '../../components/admin/AdminFormBar';
import { useAdminCms } from '../../components/admin/AdminContext';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { TextFormatHint } from '../../components/admin/TextFormatHint';
import { useToast } from '../../components/common/ToastProvider';
import { updateSiteSettings } from '../../lib/cmsService';
import { DEFAULT_SITE_COPY } from '../../lib/defaults';
import { uploadDraftImage } from '../../lib/media';

export function HeroEditorPage() {
  const { bundle, reloadBundle } = useAdminCms();
  const { showToast } = useToast();

  const [heroTitle, setHeroTitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroCtaLabel, setHeroCtaLabel] = useState('');
  const [heroSecondaryCtaLabel, setHeroSecondaryCtaLabel] = useState('');
  const [heroBadgeText, setHeroBadgeText] = useState('');
  const [heroDetailCaption, setHeroDetailCaption] = useState('');
  const [heroWaMessage, setHeroWaMessage] = useState('');

  const [primaryMediaId, setPrimaryMediaId] = useState<string | null>(null);
  const [primaryDemoUrl, setPrimaryDemoUrl] = useState<string | null>(null);
  const [primaryAlt, setPrimaryAlt] = useState('');
  const [primaryFocusX, setPrimaryFocusX] = useState(50);
  const [primaryFocusY, setPrimaryFocusY] = useState(26);
  const [primaryZoom, setPrimaryZoom] = useState(100);
  const [pendingPrimaryFile, setPendingPrimaryFile] = useState<File | null>(null);

  const [secondaryMediaId, setSecondaryMediaId] = useState<string | null>(null);
  const [secondaryDemoUrl, setSecondaryDemoUrl] = useState<string | null>(null);
  const [secondaryAlt, setSecondaryAlt] = useState('');
  const [secondaryFocusX, setSecondaryFocusX] = useState(50);
  const [secondaryFocusY, setSecondaryFocusY] = useState(50);
  const [secondaryZoom, setSecondaryZoom] = useState(100);
  const [pendingSecondaryFile, setPendingSecondaryFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!bundle) return;
    const s = bundle.settings;
    const copy = s.site_copy ?? DEFAULT_SITE_COPY;
    setHeroTitle(s.hero_title);
    setHeroDescription(s.hero_description);
    setHeroCtaLabel(s.hero_cta_label);
    setHeroSecondaryCtaLabel(copy.hero_secondary_cta_label);
    setHeroBadgeText(copy.hero_badge_text);
    setHeroDetailCaption(copy.hero_detail_caption);
    setHeroWaMessage(s.hero_whatsapp_message);
    setPrimaryMediaId(s.hero_primary_media_id);
    setPrimaryDemoUrl(s.hero_primary_demo_url);
    setPrimaryAlt(s.hero_primary_alt);
    setPrimaryFocusX(s.hero_primary_focus_x);
    setPrimaryFocusY(s.hero_primary_focus_y);
    setPrimaryZoom(s.hero_primary_zoom ?? 100);
    setSecondaryMediaId(s.hero_secondary_media_id);
    setSecondaryDemoUrl(s.hero_secondary_demo_url);
    setSecondaryAlt(s.hero_secondary_alt);
    setSecondaryFocusX(s.hero_secondary_focus_x);
    setSecondaryFocusY(s.hero_secondary_focus_y);
    setSecondaryZoom(s.hero_secondary_zoom ?? 100);
    setPendingPrimaryFile(null);
    setPendingSecondaryFile(null);
  }, [bundle]);

  if (!bundle) return null;
  const s = bundle.settings;
  const copy = s.site_copy ?? DEFAULT_SITE_COPY;

  const isDirty =
    heroTitle !== s.hero_title ||
    heroDescription !== s.hero_description ||
    heroCtaLabel !== s.hero_cta_label ||
    heroSecondaryCtaLabel !== copy.hero_secondary_cta_label ||
    heroBadgeText !== copy.hero_badge_text ||
    heroDetailCaption !== copy.hero_detail_caption ||
    heroWaMessage !== s.hero_whatsapp_message ||
    primaryMediaId !== s.hero_primary_media_id ||
    primaryDemoUrl !== s.hero_primary_demo_url ||
    primaryAlt !== s.hero_primary_alt ||
    primaryFocusX !== s.hero_primary_focus_x ||
    primaryFocusY !== s.hero_primary_focus_y ||
    primaryZoom !== (s.hero_primary_zoom ?? 100) ||
    secondaryMediaId !== s.hero_secondary_media_id ||
    secondaryDemoUrl !== s.hero_secondary_demo_url ||
    secondaryAlt !== s.hero_secondary_alt ||
    secondaryFocusX !== s.hero_secondary_focus_x ||
    secondaryFocusY !== s.hero_secondary_focus_y ||
    secondaryZoom !== (s.hero_secondary_zoom ?? 100) ||
    pendingPrimaryFile !== null ||
    pendingSecondaryFile !== null;

  const currentPrimaryUrl = primaryMediaId
    ? (bundle.mediaUrls[primaryMediaId] ?? null)
    : primaryDemoUrl;
  const currentSecondaryUrl = secondaryMediaId
    ? (bundle.mediaUrls[secondaryMediaId] ?? null)
    : secondaryDemoUrl;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!heroTitle.trim()) {
      setSaveError('Judul hero wajib diisi.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      let nextPrimaryId = primaryMediaId;
      let nextPrimaryDemo = primaryDemoUrl;
      if (pendingPrimaryFile) {
        const asset = await uploadDraftImage(pendingPrimaryFile, 'hero', primaryAlt);
        nextPrimaryId = asset.id;
        nextPrimaryDemo = null;
      }

      let nextSecondaryId = secondaryMediaId;
      let nextSecondaryDemo = secondaryDemoUrl;
      if (pendingSecondaryFile) {
        const asset = await uploadDraftImage(pendingSecondaryFile, 'hero', secondaryAlt);
        nextSecondaryId = asset.id;
        nextSecondaryDemo = null;
      }

      await updateSiteSettings({
        hero_title: heroTitle.trim(),
        hero_description: heroDescription.trim(),
        hero_cta_label: heroCtaLabel.trim() || 'Konsultasi via WhatsApp',
        hero_whatsapp_message: heroWaMessage.trim(),
        hero_primary_media_id: nextPrimaryId,
        hero_primary_demo_url: nextPrimaryDemo,
        hero_primary_alt: primaryAlt.trim(),
        hero_primary_focus_x: primaryFocusX,
        hero_primary_focus_y: primaryFocusY,
        hero_primary_zoom: primaryZoom,
        hero_secondary_media_id: nextSecondaryId,
        hero_secondary_demo_url: nextSecondaryDemo,
        hero_secondary_alt: secondaryAlt.trim(),
        hero_secondary_focus_x: secondaryFocusX,
        hero_secondary_focus_y: secondaryFocusY,
        hero_secondary_zoom: secondaryZoom,
        site_copy: {
          hero_secondary_cta_label: heroSecondaryCtaLabel.trim() || 'Lihat Layanan',
          hero_badge_text: heroBadgeText.trim(),
          hero_detail_caption: heroDetailCaption.trim(),
        },
      });

      await reloadBundle();
      setSaveSuccess('Bagian Hero berhasil disimpan sebagai draft.');
      showToast('Konten Hero tersimpan ke draft.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan bagian Hero.';
      setSaveError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#8F454B]">Hero (Bagian Utama Atas)</h1>
        <p className="text-sm text-[#594448]/80 mt-1">
          Atur judul pembuka, tombol konsultasi, serta foto melengkung dan titik fokus wajah.
        </p>
      </div>

      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="hero-title" className="block text-sm font-medium text-[#8F454B]">
            Judul Utama Hero
          </label>
          <input
            id="hero-title"
            type="text"
            required
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
          />
          <TextFormatHint />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="hero-desc" className="block text-sm font-medium text-[#8F454B]">
            Deskripsi Hero
          </label>
          <textarea
            id="hero-desc"
            rows={3}
            value={heroDescription}
            onChange={(e) => setHeroDescription(e.target.value)}
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="hero-cta" className="block text-sm font-medium text-[#8F454B]">
              Label Tombol Konsultasi
            </label>
            <input
              id="hero-cta"
              type="text"
              value={heroCtaLabel}
              onChange={(e) => setHeroCtaLabel(e.target.value)}
              placeholder="Konsultasi via WhatsApp"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="hero-wa-msg" className="block text-sm font-medium text-[#8F454B]">
              Pesan Awal Konsultasi WhatsApp
            </label>
            <input
              id="hero-wa-msg"
              type="text"
              value={heroWaMessage}
              onChange={(e) => setHeroWaMessage(e.target.value)}
              placeholder="Halo Niwayuliana Makeup Artist, saya ingin berkonsultasi..."
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 border-t border-[#B96B78]/15">
          <div className="space-y-1.5">
            <label htmlFor="hero-cta-sec" className="block text-sm font-medium text-[#8F454B]">
              Label Tombol Kedua
            </label>
            <input
              id="hero-cta-sec"
              type="text"
              value={heroSecondaryCtaLabel}
              onChange={(e) => setHeroSecondaryCtaLabel(e.target.value)}
              placeholder="Lihat Layanan"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="hero-badge-txt" className="block text-sm font-medium text-[#8F454B]">
              Teks Badge Pojok Foto
            </label>
            <input
              id="hero-badge-txt"
              type="text"
              value={heroBadgeText}
              onChange={(e) => setHeroBadgeText(e.target.value)}
              placeholder="Natural · Luminous · Timeless"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
            />
            <p className="text-[11px] text-[#594448]/70">Kosongkan bila tidak ingin ditampilkan.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="hero-detail-cap" className="block text-sm font-medium text-[#8F454B]">
              Keterangan Detail Bawah
            </label>
            <input
              id="hero-detail-cap"
              type="text"
              value={heroDetailCaption}
              onChange={(e) => setHeroDetailCaption(e.target.value)}
              placeholder="Signature Natural & Soft Glam"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
            />
          </div>
        </div>
      </div>

      {/* Foto Utama Hero (Latar Setengah Kanan) */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-4">
        <ImageUploadField
          label="Foto Utama Hero (Latar Setengah Kanan)"
          hint="Tampil melebar di sisi kanan Hero dengan gradasi leleh Soft Blush di tepi kiri. Geser dan zoom agar wajah berada rapi di sisi tengah-kanan."
          recommendedSize="1200 × 1000 px atau rasio 4:3 / 3:4"
          currentUrl={currentPrimaryUrl}
          pendingFile={pendingPrimaryFile}
          onSelectFile={setPendingPrimaryFile}
          aspectMode="hero-half"
          showFocusPicker
          focusX={primaryFocusX}
          focusY={primaryFocusY}
          onChangeFocus={(x, y) => {
            setPrimaryFocusX(x);
            setPrimaryFocusY(y);
          }}
          zoom={primaryZoom}
          onChangeZoom={setPrimaryZoom}
        />

        <div className="space-y-1.5">
          <label htmlFor="hero-primary-alt" className="block text-sm font-medium text-[#8F454B]">
            Alt Text Foto Utama
          </label>
          <input
            id="hero-primary-alt"
            type="text"
            value={primaryAlt}
            onChange={(e) => setPrimaryAlt(e.target.value)}
            placeholder="Deskripsi singkat foto untuk aksesibilitas dan SEO"
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
          />
        </div>
      </div>

      {/* Foto Detail Tambahan (Lingkaran Medallion) */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-4">
        <ImageUploadField
          label="Foto Tambahan (Lingkaran Detail Riasan)"
          hint="Tampil berbentuk lingkaran kecil di bagian bawah tombol Hero. Seret dan atur zoom agar wajah/detail riasan tepat di tengah lingkaran."
          recommendedSize="600 × 600 px (rasio 1:1 persegi untuk bingkai lingkaran)"
          currentUrl={currentSecondaryUrl}
          pendingFile={pendingSecondaryFile}
          onSelectFile={setPendingSecondaryFile}
          hasRemovableImage={Boolean(secondaryMediaId || secondaryDemoUrl)}
          onClearImage={() => {
            setSecondaryMediaId(null);
            setSecondaryDemoUrl(null);
          }}
          aspectMode="circle"
          showFocusPicker
          focusX={secondaryFocusX}
          focusY={secondaryFocusY}
          onChangeFocus={(x, y) => {
            setSecondaryFocusX(x);
            setSecondaryFocusY(y);
          }}
          zoom={secondaryZoom}
          onChangeZoom={setSecondaryZoom}
        />

        <div className="space-y-1.5">
          <label htmlFor="hero-secondary-alt" className="block text-sm font-medium text-[#8F454B]">
            Alt Text Foto Tambahan
          </label>
          <input
            id="hero-secondary-alt"
            type="text"
            value={secondaryAlt}
            onChange={(e) => setSecondaryAlt(e.target.value)}
            placeholder="Deskripsi singkat detail riasan"
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
