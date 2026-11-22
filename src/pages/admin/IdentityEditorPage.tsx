import { useEffect, useState, type FormEvent } from 'react';
import { AdminFormBar } from '../../components/admin/AdminFormBar';
import { useAdminCms } from '../../components/admin/AdminContext';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { TextFormatHint } from '../../components/admin/TextFormatHint';
import { FormattedText } from '../../components/common/FormattedTitle';
import { useToast } from '../../components/common/ToastProvider';
import { updateSiteSettings } from '../../lib/cmsService';
import { DEFAULT_BRAND_LOGO_URL, resolveBrandLogoUrl } from '../../lib/defaults';
import { uploadDraftImage } from '../../lib/media';
import type { BrandDisplayMode } from '../../types/cms';

export function IdentityEditorPage() {
  const { bundle, reloadBundle } = useAdminCms();
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [businessSubtext, setBusinessSubtext] = useState('');
  const [businessTagline, setBusinessTagline] = useState('');
  const [brandDisplayMode, setBrandDisplayMode] = useState<BrandDisplayMode>('both');

  const [logoMediaId, setLogoMediaId] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingLogoPreview, setPendingLogoPreview] = useState<string | null>(null);
  const [faviconMediaId, setFaviconMediaId] = useState<string | null>(null);
  const [pendingFaviconFile, setPendingFaviconFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!bundle) return;
    const s = bundle.settings;
    setBusinessName(s.business_name);
    setBusinessSubtext(s.business_subtext);
    setBusinessTagline(s.business_tagline);
    setBrandDisplayMode(s.brand_display_mode);
    setLogoMediaId(s.logo_media_id);
    setFaviconMediaId(s.favicon_media_id);
    setPendingLogoFile(null);
    setPendingFaviconFile(null);
  }, [bundle]);

  useEffect(() => {
    if (!pendingLogoFile) {
      setPendingLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(pendingLogoFile);
    setPendingLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingLogoFile]);

  if (!bundle) return null;
  const s = bundle.settings;

  const isDirty =
    businessName !== s.business_name ||
    businessSubtext !== s.business_subtext ||
    businessTagline !== s.business_tagline ||
    brandDisplayMode !== s.brand_display_mode ||
    logoMediaId !== s.logo_media_id ||
    faviconMediaId !== s.favicon_media_id ||
    pendingLogoFile !== null ||
    pendingFaviconFile !== null;

  const savedOrDefaultLogoUrl = logoMediaId
    ? (bundle.mediaUrls[logoMediaId] ?? DEFAULT_BRAND_LOGO_URL)
    : DEFAULT_BRAND_LOGO_URL;
  const liveLogoUrl = pendingLogoPreview ?? savedOrDefaultLogoUrl;
  const previewLogoUrl = resolveBrandLogoUrl(liveLogoUrl);
  const currentFaviconUrl = faviconMediaId ? (bundle.mediaUrls[faviconMediaId] ?? null) : null;

  const showPreviewLogo = brandDisplayMode === 'logo' || brandDisplayMode === 'both';
  const showPreviewText = brandDisplayMode === 'text' || brandDisplayMode === 'both';

  const handleSelectLogoFile = (file: File | null) => {
    setPendingLogoFile(file);
    if (file && brandDisplayMode === 'text') {
      setBrandDisplayMode('both');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setSaveError('Nama bisnis wajib diisi.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      let nextLogoId = logoMediaId;
      if (pendingLogoFile) {
        const asset = await uploadDraftImage(
          pendingLogoFile,
          'branding',
          `Logo ${businessName.trim()}`
        );
        nextLogoId = asset.id;
      }

      let nextFaviconId = faviconMediaId;
      if (pendingFaviconFile) {
        const asset = await uploadDraftImage(
          pendingFaviconFile,
          'branding',
          `Favicon ${businessName.trim()}`
        );
        nextFaviconId = asset.id;
      }

      await updateSiteSettings({
        business_name: businessName.trim(),
        business_subtext: businessSubtext.trim(),
        business_tagline: businessTagline.trim(),
        brand_display_mode: brandDisplayMode,
        logo_media_id: nextLogoId,
        favicon_media_id: nextFaviconId,
      });

      await reloadBundle();
      setSaveSuccess('Identitas bisnis & logo berhasil disimpan sebagai draft.');
      showToast('Identitas bisnis tersimpan ke draft.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan identitas bisnis.';
      setSaveError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#8F454B]">Identitas Bisnis &amp; Logo</h1>
        <p className="text-sm text-[#594448]/80 mt-1">
          Kelola logo brand, nama bisnis, favicon, dan cara tampilannya di header maupun footer.
        </p>
      </div>

      {/* Preview Header Brand Langsung */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#B96B78]">
            Preview Tampilan di Header Website
          </span>
          <span className="text-xs text-[#594448]/75">
            {logoMediaId || pendingLogoFile
              ? 'Menggunakan logo kustom yang diunggah'
              : 'Menggunakan logo bawaan Soft Blush'}
          </span>
        </div>
        <div className="rounded-xl border border-[#B96B78]/15 bg-[#FFF9F5] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showPreviewLogo && (
              <img
                src={previewLogoUrl}
                alt={businessName || 'Logo'}
                className={`${
                  showPreviewText ? 'h-12 max-w-[140px]' : 'h-14 max-w-[180px]'
                } w-auto shrink-0 object-contain`}
              />
            )}
            {showPreviewText && (
              <div className="flex flex-col leading-none">
                <span className="font-serif text-lg font-semibold tracking-[0.16em] uppercase text-[#8F454B]">
                  <FormattedText text={businessName || 'NIWAYULIANA'} />
                </span>
                {businessSubtext && (
                  <span className="text-[10px] tracking-[0.28em] uppercase text-[#B96B78] mt-1">
                    <FormattedText text={businessSubtext} />
                  </span>
                )}
              </div>
            )}
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#B96B78]/25 bg-[#F8E6EB]/35 pl-2.5 pr-1.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#594448]/80">
            <span>by</span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white border border-[#B96B78]/20 overflow-hidden">
              <img src="/daysheet-logo.png" alt="DaySheet" className="w-full h-full object-contain p-0.5" />
            </span>
          </span>
        </div>
        {brandDisplayMode === 'text' && (
          <div className="rounded-xl border border-[#B96B78]/25 bg-[#F8E6EB]/55 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#594448]">
            <span>
              Logo saat ini disembunyikan karena mode tampilan masih{' '}
              <strong>Teks Nama Bisnis Saja</strong>.
            </span>
            <button
              type="button"
              onClick={() => setBrandDisplayMode('both')}
              className="rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-3.5 py-1.5 text-xs font-medium transition-colors"
            >
              Tampilkan Logo di Header
            </button>
          </div>
        )}
      </div>

      {/* Upload & Pengaturan Logo */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-6">
        <ImageUploadField
          label="Logo Bisnis"
          hint={
            logoMediaId
              ? 'Klik "Lepas Gambar" bila ingin kembali menggunakan logo bawaan Niwayuliana.'
              : 'Saat ini memakai logo bawaan Niwayuliana. Pilih gambar PNG/WebP/JPG bila ingin menggantinya dengan logo kustom Anda.'
          }
          recommendedSize="400 × 120 px atau 256 × 256 px (PNG/WebP transparan)"
          currentUrl={savedOrDefaultLogoUrl}
          pendingFile={pendingLogoFile}
          onSelectFile={handleSelectLogoFile}
          hasRemovableImage={Boolean(logoMediaId)}
          onClearImage={() => setLogoMediaId(null)}
          aspectMode="contain"
        />

        <div className="space-y-2 pt-2 border-t border-[#B96B78]/15">
          <span className="block text-sm font-medium text-[#8F454B]">
            Tampilan Brand di Header &amp; Footer
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'both' as const, label: 'Logo + Teks Nama Bisnis' },
              { value: 'logo' as const, label: 'Logo Gambar Saja' },
              { value: 'text' as const, label: 'Teks Nama Bisnis Saja' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-sm cursor-pointer transition-colors ${
                  brandDisplayMode === option.value
                    ? 'border-[#B96B78] bg-[#F8E6EB]/65 text-[#8F454B] font-medium'
                    : 'border-[#B96B78]/20 bg-white text-[#594448]'
                }`}
              >
                <input
                  type="radio"
                  name="brand-display-mode"
                  value={option.value}
                  checked={brandDisplayMode === option.value}
                  onChange={() => setBrandDisplayMode(option.value)}
                  className="accent-[#B96B78]"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Nama Bisnis & Deskripsi */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="business-name" className="block text-sm font-medium text-[#8F454B]">
              Nama Bisnis
            </label>
            <input
              id="business-name"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="NIWAYULIANA"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="business-subtext" className="block text-sm font-medium text-[#8F454B]">
              Subteks Nama Bisnis
            </label>
            <input
              id="business-subtext"
              type="text"
              value={businessSubtext}
              onChange={(e) => setBusinessSubtext(e.target.value)}
              placeholder="MAKEUP ARTIST"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="business-tagline" className="block text-sm font-medium text-[#8F454B]">
            Deskripsi Singkat (Footer)
          </label>
          <textarea
            id="business-tagline"
            rows={3}
            value={businessTagline}
            onChange={(e) => setBusinessTagline(e.target.value)}
            placeholder="Deskripsi singkat tentang layanan makeup Anda..."
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
          />
          <TextFormatHint />
        </div>

        <div className="border-t border-[#B96B78]/15 pt-6">
          <ImageUploadField
            label="Favicon Tab Browser (Opsional)"
            hint="Ikon kecil yang tampil pada tab browser pengunjung."
            recommendedSize="256 × 256 px (rasio 1:1 persegi)"
            currentUrl={currentFaviconUrl}
            pendingFile={pendingFaviconFile}
            onSelectFile={setPendingFaviconFile}
            hasRemovableImage={Boolean(faviconMediaId)}
            onClearImage={() => setFaviconMediaId(null)}
            aspectMode="square"
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
