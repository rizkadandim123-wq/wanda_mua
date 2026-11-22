import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  Eye,
  Image as ImageIcon,
  MessageSquareQuote,
  Phone,
  Rocket,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminCms } from '../../components/admin/AdminContext';
import { formatWhatsAppDigits } from '../../lib/validation';

export function DashboardPage() {
  const { bundle, publishStatus, publishNow, isPublishing } = useAdminCms();

  if (!bundle) return null;

  const visibleServices = bundle.services.filter((s) => s.is_visible).length;
  const visiblePortfolio = bundle.portfolioItems.filter((p) => p.is_visible).length;
  const visibleTestimonials = bundle.testimonials.filter((t) => t.is_visible).length;
  const hasValidWhatsApp = Boolean(formatWhatsAppDigits(bundle.settings.whatsapp_number));

  const publishedDate = publishStatus.publishedAt
    ? new Date(publishStatus.publishedAt).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Belum ada publikasi';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#8F454B]">Dashboard CMS</h1>
        <p className="text-sm text-[#594448]/80 mt-1">
          Kelola seluruh konten website <strong>{bundle.settings.business_name}</strong> dengan alur
          simpan draft, preview, lalu publikasi.
        </p>
      </div>

      {/* Banner Status Publikasi */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          publishStatus.hasUnpublishedChanges
            ? 'bg-amber-50/75 border-amber-200'
            : 'bg-emerald-50/70 border-emerald-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {publishStatus.hasUnpublishedChanges ? (
            <Clock className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-700 mt-0.5" />
          )}
          <div>
            <p className="font-medium text-sm sm:text-base text-[#594448]">
              {publishStatus.hasUnpublishedChanges
                ? 'Ada perubahan draft yang belum dipublikasikan'
                : 'Website publik menampilkan seluruh perubahan terbaru'}
            </p>
            <p className="text-xs text-[#594448]/80 mt-1">
              Versi tayang: <strong>v{publishStatus.publishedReleaseNumber ?? 0}</strong> · Terakhir
              dipublikasikan: {publishedDate}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/preview"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#B96B78]/35 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-[#8F454B] hover:bg-[#F8E6EB]/50"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Draft</span>
          </Link>

          <button
            type="button"
            onClick={() => void publishNow()}
            disabled={isPublishing}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-4 py-2 text-xs sm:text-sm font-medium disabled:opacity-60"
          >
            <Rocket className="w-4 h-4" />
            <span>{isPublishing ? 'Mempublikasikan...' : 'Publikasikan'}</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Konten Nyata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/services"
          className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 hover:border-[#B96B78]/45 transition-colors"
        >
          <div className="flex items-center justify-between text-[#B96B78]">
            <span className="text-xs uppercase tracking-wider font-medium">Layanan</span>
            <Briefcase className="w-5 h-5" />
          </div>
          <p className="mt-3 font-serif text-3xl text-[#8F454B]">{bundle.services.length}</p>
          <p className="mt-1 text-xs text-[#594448]/75">
            {visibleServices} tampil · {bundle.serviceCategories.length} kategori
          </p>
        </Link>

        <Link
          to="/admin/portfolio"
          className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 hover:border-[#B96B78]/45 transition-colors"
        >
          <div className="flex items-center justify-between text-[#B96B78]">
            <span className="text-xs uppercase tracking-wider font-medium">Foto Portofolio</span>
            <ImageIcon className="w-5 h-5" />
          </div>
          <p className="mt-3 font-serif text-3xl text-[#8F454B]">{bundle.portfolioItems.length}</p>
          <p className="mt-1 text-xs text-[#594448]/75">
            {visiblePortfolio} tampil · {bundle.categories.length} kategori
          </p>
        </Link>

        <Link
          to="/admin/testimonials"
          className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 hover:border-[#B96B78]/45 transition-colors"
        >
          <div className="flex items-center justify-between text-[#B96B78]">
            <span className="text-xs uppercase tracking-wider font-medium">Testimoni</span>
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <p className="mt-3 font-serif text-3xl text-[#8F454B]">{bundle.testimonials.length}</p>
          <p className="mt-1 text-xs text-[#594448]/75">
            {visibleTestimonials === 0
              ? 'Bagian testimoni otomatis tersembunyi'
              : `${visibleTestimonials} tampil di halaman`}
          </p>
        </Link>
      </div>

      {/* Pengingat Konfigurasi Awal */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-6 space-y-4">
        <h2 className="font-serif text-xl text-[#8F454B]">Daftar Periksa Persiapan</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4 rounded-xl bg-[#FAF6F4] p-3.5">
            <div className="flex items-start gap-2.5">
              {hasValidWhatsApp ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="font-medium text-[#594448]">Nomor WhatsApp Konsultasi</p>
                <p className="text-xs text-[#594448]/75 mt-0.5">
                  {hasValidWhatsApp
                    ? `Sudah diisi (${bundle.settings.whatsapp_number}). Tombol konsultasi aktif.`
                    : 'Belum diisi. Isi nomor WhatsApp asli bisnis Anda agar tombol Konsultasi via WhatsApp membuka chat langsung.'}
                </p>
              </div>
            </div>
            <Link
              to="/admin/contact"
              className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[#B96B78]/35 px-3 py-1 text-xs font-medium text-[#8F454B] hover:bg-[#F8E6EB]/60"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Atur Kontak</span>
            </Link>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl bg-[#FAF6F4] p-3.5">
            <div className="flex items-start gap-2.5">
              <ImageIcon className="w-4 h-4 text-[#B96B78] mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-[#594448]">Ganti Foto Demo dengan Foto Asli</p>
                <p className="text-xs text-[#594448]/75 mt-0.5">
                  Foto bawaan pada Hero, Layanan, Tentang, dan Portofolio adalah foto demo. Unggah
                  foto hasil riasan asli Anda di masing-masing menu lalu klik Publikasikan.
                </p>
              </div>
            </div>
            <Link
              to="/admin/hero"
              className="shrink-0 rounded-full border border-[#B96B78]/35 px-3 py-1 text-xs font-medium text-[#8F454B] hover:bg-[#F8E6EB]/60"
            >
              Edit Hero
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
