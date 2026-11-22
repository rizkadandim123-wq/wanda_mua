import { useEffect, useState, type FormEvent } from 'react';
import { Info } from 'lucide-react';
import { AdminFormBar } from '../../components/admin/AdminFormBar';
import { useAdminCms } from '../../components/admin/AdminContext';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { useToast } from '../../components/common/ToastProvider';
import { updateSiteSettings } from '../../lib/cmsService';
import { uploadDraftImage } from '../../lib/media';

export function SeoEditorPage() {
  const { bundle, reloadBundle } = useAdminCms();
  const { showToast } = useToast();

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [ogMediaId, setOgMediaId] = useState<string | null>(null);
  const [ogAlt, setOgAlt] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!bundle) return;
    const s = bundle.settings;
    setSeoTitle(s.seo_title);
    setSeoDescription(s.seo_description);
    setOgMediaId(s.seo_og_media_id);
    setOgAlt(s.seo_og_alt);
    setPendingFile(null);
  }, [bundle]);

  if (!bundle) return null;
  const s = bundle.settings;

  const isDirty =
    seoTitle !== s.seo_title ||
    seoDescription !== s.seo_description ||
    ogMediaId !== s.seo_og_media_id ||
    ogAlt !== s.seo_og_alt ||
    pendingFile !== null;

  const currentOgUrl = ogMediaId ? (bundle.mediaUrls[ogMediaId] ?? null) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!seoTitle.trim()) {
      setSaveError('Judul SEO website wajib diisi.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      let nextOgId = ogMediaId;
      if (pendingFile) {
        const asset = await uploadDraftImage(pendingFile, 'seo', ogAlt || seoTitle);
        nextOgId = asset.id;
      }

      await updateSiteSettings({
        seo_title: seoTitle.trim(),
        seo_description: seoDescription.trim(),
        seo_og_media_id: nextOgId,
        seo_og_alt: ogAlt.trim(),
      });

      await reloadBundle();
      setSaveSuccess('Pengaturan SEO berhasil disimpan sebagai draft.');
      showToast('Pengaturan SEO tersimpan ke draft.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan SEO.';
      setSaveError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#8F454B]">SEO &amp; Preview Link</h1>
        <p className="text-sm text-[#594448]/80 mt-1">
          Atur judul tab browser, deskripsi pencarian, dan gambar preview saat tautan website
          dibagikan.
        </p>
      </div>

      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#F8E6EB]/45 p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-sm text-[#594448]">
        <Info className="w-5 h-5 shrink-0 text-[#8F454B] mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-[#8F454B]">Catatan Mengenai Crawler &amp; Preview Link</p>
          <p className="leading-relaxed">
            Website ini berjalan sebagai aplikasi React client-side rendering (SPA). Pengaturan SEO
            langsung memperbarui judul dan meta tag di browser serta mesin pencari modern (seperti
            Google) yang menjalankan JavaScript. Namun, bot preview media sosial statis (seperti
            WhatsApp atau Facebook scraper yang tidak menjalankan JavaScript) akan membaca nilai
            meta tag awal di <code>index.html</code>, kecuali Anda menambahkan Cloudflare Pages
            Function untuk menyisipkan meta tag dinamis di sisi server.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="seo-title" className="block text-sm font-medium text-[#8F454B]">
              Judul Website (Title Tag)
            </label>
            <span className="text-xs text-[#594448]/70">{seoTitle.length} karakter</span>
          </div>
          <input
            id="seo-title"
            type="text"
            required
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="seo-desc" className="block text-sm font-medium text-[#8F454B]">
              Meta Description
            </label>
            <span className="text-xs text-[#594448]/70">
              {seoDescription.length} / 160 disarankan
            </span>
          </div>
          <textarea
            id="seo-desc"
            rows={3}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>

        <ImageUploadField
          label="Gambar Preview Share Link (Open Graph)"
          hint="Ditampilkan saat link website dibagikan di media sosial atau chat."
          recommendedSize="1200 × 630 px (rasio 1.91:1 landscape)"
          currentUrl={currentOgUrl}
          pendingFile={pendingFile}
          onSelectFile={setPendingFile}
          hasRemovableImage={Boolean(ogMediaId)}
          onClearImage={() => setOgMediaId(null)}
          aspectMode="landscape"
        />

        <div className="space-y-1.5">
          <label htmlFor="seo-og-alt" className="block text-sm font-medium text-[#8F454B]">
            Alt Text Gambar Preview
          </label>
          <input
            id="seo-og-alt"
            type="text"
            value={ogAlt}
            onChange={(e) => setOgAlt(e.target.value)}
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Simulasi Preview Hasil Pencarian */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-6 space-y-2">
        <p className="text-xs uppercase tracking-wider text-[#B96B78] font-medium">
          Simulasi Tampilan Hasil Pencarian
        </p>
        <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-1">
          <p className="text-base font-medium text-[#1a0dab] truncate">
            {seoTitle || 'Niwayuliana Makeup Artist'}
          </p>
          <p className="text-xs text-emerald-700">https://domain-anda.pages.dev/</p>
          <p className="text-xs text-stone-600 line-clamp-2">
            {seoDescription || 'Deskripsi website akan tampil di sini.'}
          </p>
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
