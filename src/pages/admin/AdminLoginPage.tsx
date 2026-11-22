import { useEffect, useState, type FormEvent } from 'react';
import { AlertTriangle, Lock, Sparkles, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { DEFAULT_BRAND_LOGO_URL } from '../../lib/defaults';

export function AdminLoginPage() {
  const { isAdmin, hasAdmin, isConfigured, loading, authError, setupFirstAdmin, signIn } =
    useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('Admin Niwayuliana');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Login Admin — Niwayuliana Makeup Artist';
  }, []);

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Masukkan username dan kata sandi admin.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    const res = await signIn(username, password);
    setSubmitting(false);

    if (res.ok) {
      navigate('/admin', { replace: true });
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleSetupFirstAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (username.trim().length < 3) {
      setErrorMsg('Username minimal 3 karakter (huruf, angka, titik, atau garis bawah).');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Kata sandi minimal harus 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSubmitting(true);
    const res = await setupFirstAdmin(username, password, displayName);
    setSubmitting(false);

    if (res.ok) {
      navigate('/admin', { replace: true });
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(155deg, #F8E6EB 0%, #FFF9F5 55%, #F8E6EB 100%)',
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-[#B96B78]/20 bg-[#FFF9F5] p-7 sm:p-9 shadow-sm">
        <div className="text-center space-y-2">
          <img
            src={DEFAULT_BRAND_LOGO_URL}
            alt="Niwayuliana Makeup Artist"
            className="mx-auto h-24 w-auto max-w-[160px] object-contain"
          />
          <p className="font-serif text-xl tracking-[0.14em] uppercase text-[#8F454B]">
            NIWAYULIANA
          </p>
          <h1 className="text-base font-medium text-[#594448]">
            {isConfigured && !hasAdmin ? 'Buat Akun Admin Pertama' : 'Masuk ke Admin CMS'}
          </h1>
          <p className="text-xs text-[#594448]/75">
            {isConfigured && !hasAdmin
              ? 'Belum ada profil admin di database. Buat satu akun pengelola utama (tanpa email).'
              : 'Login menggunakan username dan kata sandi profil admin Anda.'}
          </p>
        </div>

        {loading ? (
          <div className="mt-8 py-6 text-center text-sm text-[#594448]/75">
            Memeriksa status server...
          </div>
        ) : !isConfigured ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
              <span>Supabase Belum Dikonfigurasi di Server</span>
            </div>
            <p className="leading-relaxed">
              Server Cloudflare / Vite belum menerima environment <code>SUPABASE_URL</code> dan{' '}
              <code>SUPABASE_SERVICE_ROLE_KEY</code>. Lengkapi pada file <code>.env</code> atau
              Environment Variables Cloudflare lalu jalankan 3 migrasi SQL di{' '}
              <code>supabase/migrations/</code>.
            </p>
          </div>
        ) : !hasAdmin ? (
          <form onSubmit={handleSetupFirstAdmin} className="mt-7 space-y-4">
            {(errorMsg || authError) && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs sm:text-sm text-rose-800">
                {errorMsg || authError}
              </div>
            )}

            <div className="rounded-xl border border-[#B96B78]/20 bg-[#F8E6EB]/50 p-3 flex items-start gap-2 text-xs text-[#594448]">
              <Sparkles className="w-4 h-4 text-[#B96B78] shrink-0 mt-0.5" />
              <span>
                Halaman setup awal ini hanya aktif sekali sampai 1 akun admin tersimpan di tabel{' '}
                <code>public.profiles</code>.
              </span>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setup-username" className="block text-sm font-medium text-[#8F454B]">
                Username Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#B96B78] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="setup-username"
                  type="text"
                  required
                  minLength={3}
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="contoh: niwayuliana"
                  className="w-full rounded-xl border border-[#B96B78]/25 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setup-display" className="block text-sm font-medium text-[#8F454B]">
                Nama Tampilan
              </label>
              <input
                id="setup-display"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Admin Niwayuliana"
                className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setup-pass" className="block text-sm font-medium text-[#8F454B]">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B96B78] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="setup-pass"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full rounded-xl border border-[#B96B78]/25 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setup-confirm" className="block text-sm font-medium text-[#8F454B]">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B96B78] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="setup-confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="w-full rounded-xl border border-[#B96B78]/25 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white py-3 text-sm font-medium transition-colors disabled:opacity-60"
            >
              {submitting ? 'Menyimpan Profil...' : 'Buat Akun Admin & Masuk'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            {(errorMsg || authError) && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs sm:text-sm text-rose-800">
                {errorMsg || authError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="admin-username" className="block text-sm font-medium text-[#8F454B]">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#B96B78] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username admin"
                  className="w-full rounded-xl border border-[#B96B78]/25 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-sm font-medium text-[#8F454B]">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B96B78] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#B96B78]/25 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#594448] focus:outline-none focus:ring-2 focus:ring-[#B96B78]/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white py-3 text-sm font-medium transition-colors disabled:opacity-60"
            >
              {submitting ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-[#B96B78]/15 text-center">
          <Link to="/" className="text-xs text-[#8F454B] hover:underline underline-offset-4">
            ← Kembali ke Website Publik
          </Link>
        </div>
      </div>
    </div>
  );
}
