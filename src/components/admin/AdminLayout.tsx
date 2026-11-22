import { useState, type ReactNode } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Heart,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  Menu,
  MessageSquareQuote,
  MessageSquareText,
  Palette,
  Phone,
  Rocket,
  Search,
  Sparkles,
  Store,
  UserCog,
  X,
} from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { AdminProvider, useAdminCms } from './AdminContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { resolveBrandLogoUrl } from '../../lib/defaults';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
  { to: '/admin/identity', label: 'Identitas Bisnis', icon: <Store className="w-4 h-4" /> },
  { to: '/admin/hero', label: 'Hero', icon: <Sparkles className="w-4 h-4" /> },
  { to: '/admin/about', label: 'Tentang', icon: <Heart className="w-4 h-4" /> },
  { to: '/admin/services', label: 'Layanan', icon: <Briefcase className="w-4 h-4" /> },
  { to: '/admin/portfolio', label: 'Portofolio', icon: <ImageIcon className="w-4 h-4" /> },
  {
    to: '/admin/testimonials',
    label: 'Testimoni',
    icon: <MessageSquareQuote className="w-4 h-4" />,
  },
  { to: '/admin/contact', label: 'Kontak & Media Sosial', icon: <Phone className="w-4 h-4" /> },
  { to: '/admin/feedback', label: 'Form Masukan', icon: <MessageSquareText className="w-4 h-4" /> },
  { to: '/admin/appearance', label: 'Tampilan & Susunan', icon: <Palette className="w-4 h-4" /> },
  { to: '/admin/seo', label: 'SEO', icon: <Search className="w-4 h-4" /> },
  { to: '/admin/account', label: 'Akun', icon: <UserCog className="w-4 h-4" /> },
];

function AdminShellContent() {
  const { bundle, loading, error, publishStatus, isPublishing, reloadBundle, publishNow } =
    useAdminCms();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const handleConfirmPublish = async () => {
    const ok = await publishNow();
    if (ok) {
      setPublishDialogOpen(false);
    }
  };

  const brandLogoUrl = resolveBrandLogoUrl(
    bundle?.settings.logo_media_id
      ? (bundle.mediaUrls[bundle.settings.logo_media_id] ?? null)
      : null
  );

  const renderBrandIdentity = () => (
    <div className="flex items-center gap-2.5 min-w-0">
      <img
        src={brandLogoUrl}
        alt={bundle?.settings.business_name || 'NIWAYULIANA'}
        className="h-11 w-auto max-w-[52px] object-contain shrink-0"
      />
      <div className="min-w-0">
        <p className="font-serif text-base font-semibold tracking-wider text-[#8F454B] uppercase truncate">
          {bundle?.settings.business_name || 'NIWAYULIANA'}
        </p>
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#B96B78]">Admin CMS</p>
      </div>
    </div>
  );

  const renderNavLinks = (onSelect?: () => void) => (
    <nav className="space-y-1 px-3 py-4" aria-label="Menu Admin CMS">
      {ADMIN_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onSelect}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#F8E6EB] text-[#8F454B]'
                : 'text-[#594448] hover:bg-[#F8E6EB]/55 hover:text-[#8F454B]'
            }`
          }
        >
          <span className="text-[#B96B78]">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#FAF6F4] text-[#594448] flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-[#FFF9F5] border-r border-[#B96B78]/15">
        <div className="min-h-16 px-4 py-2.5 border-b border-[#B96B78]/15 flex items-center">
          {renderBrandIdentity()}
        </div>
        <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
      </aside>

      {/* Drawer Mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#3a2529]/45"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-[#FFF9F5] h-full flex flex-col border-r border-[#B96B78]/20 shadow-xl">
            <div className="min-h-16 px-4 py-2.5 border-b border-[#B96B78]/15 flex items-center justify-between gap-2">
              {renderBrandIdentity()}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg text-[#594448] hover:bg-[#F8E6EB]"
                aria-label="Tutup menu admin"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderNavLinks(() => setDrawerOpen(false))}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#FFF9F5]/95 backdrop-blur-md border-b border-[#B96B78]/15 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#B96B78]/25 text-[#8F454B] hover:bg-[#F8E6EB]/60"
              aria-label="Buka menu navigasi admin"
            >
              <Menu className="w-5 h-5" />
            </button>

            {bundle && (
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${
                  publishStatus.hasUnpublishedChanges
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                {publishStatus.hasUnpublishedChanges ? (
                  <>
                    <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span className="truncate">Ada perubahan belum dipublikasikan</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate">
                      Tayang versi v{publishStatus.publishedReleaseNumber ?? 1}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/preview"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#B96B78]/35 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#8F454B] hover:bg-[#F8E6EB]/60 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview Draft</span>
              <span className="sm:hidden">Preview</span>
            </Link>

            <button
              type="button"
              onClick={() => setPublishDialogOpen(true)}
              disabled={loading || !bundle || isPublishing}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Publikasikan</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-[#594448] hover:text-[#8F454B] hover:bg-[#F8E6EB]/50 transition-colors"
              title="Buka website publik di tab baru"
            >
              <span>Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#8F454B]">
              <Loader2 className="w-7 h-7 animate-spin text-[#B96B78]" />
              <p className="text-sm">Memuat data draft CMS...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900 space-y-3">
              <h2 className="font-semibold text-base">Gagal memuat data CMS</h2>
              <p className="text-sm">{error}</p>
              <button
                type="button"
                onClick={() => void reloadBundle()}
                className="rounded-full bg-[#B96B78] text-white px-4 py-2 text-sm font-medium"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      <ConfirmDialog
        open={publishDialogOpen}
        title="Publikasikan Perubahan ke Website?"
        description={
          <div className="space-y-2">
            <p>
              Seluruh draft terbaru (identitas bisnis, hero, tentang, layanan, portofolio,
              testimoni, kontak, tampilan, dan SEO) beserta foto-fotonya akan langsung tayang di
              website publik sebagai satu versi yang konsisten.
            </p>
            {!publishStatus.hasUnpublishedChanges && (
              <p className="text-xs text-[#8F454B] bg-[#F8E6EB]/60 rounded-xl p-2.5">
                Saat ini belum ada perubahan baru sejak publikasi terakhir, namun Anda tetap dapat
                mempublikasikan ulang snapshot aktif.
              </p>
            )}
          </div>
        }
        confirmLabel="Ya, Publikasikan Sekarang"
        loading={isPublishing}
        onConfirm={() => void handleConfirmPublish()}
        onCancel={() => setPublishDialogOpen(false)}
      />
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminProvider>
      <AdminShellContent />
    </AdminProvider>
  );
}
