import { useState, type FormEvent } from 'react';
import { KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/common/ToastProvider';
import { useAuth } from '../../hooks/useAuth';

export function AccountPage() {
  const { admin, updatePassword, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Masukkan kata sandi saat ini.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Kata sandi baru minimal harus terdiri dari 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setSaving(true);
    const res = await updatePassword(currentPassword, newPassword);
    setSaving(false);

    if (!res.ok) {
      setErrorMsg(res.error ?? 'Gagal mengganti kata sandi.');
      showToast(res.error ?? 'Gagal mengganti kata sandi.', 'error');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMsg('Kata sandi akun admin berhasil diperbarui.');
    showToast('Kata sandi berhasil diperbarui.', 'success');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl text-[#8F454B]">Akun Admin</h1>
        <p className="text-sm text-[#594448]/80 mt-1">
          Kelola keamanan profil admin yang sedang aktif atau keluar dari sesi CMS.
        </p>
      </div>

      {/* Info Profil Admin */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#F8E6EB] flex items-center justify-center text-[#8F454B]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#8F454B]">
              {admin?.display_name ?? 'Admin'} (@{admin?.username ?? 'admin'})
            </p>
            <p className="text-xs text-[#594448]/75 capitalize mt-0.5">
              Peran profil: {admin?.role ?? 'owner'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleLogout()}
          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 px-4 py-2 text-xs sm:text-sm font-medium text-rose-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </button>
      </div>

      {/* Ganti Kata Sandi */}
      <form
        onSubmit={handleChangePassword}
        className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-4"
      >
        <div className="flex items-center gap-2 text-[#8F454B]">
          <KeyRound className="w-5 h-5 text-[#B96B78]" />
          <h2 className="font-serif text-xl">Ganti Kata Sandi</h2>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
            {successMsg}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="current-password" className="block text-sm font-medium text-[#8F454B]">
            Kata Sandi Saat Ini
          </label>
          <input
            id="current-password"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Masukkan kata sandi saat ini"
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-password" className="block text-sm font-medium text-[#8F454B]">
            Kata Sandi Baru
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-[#8F454B]">
            Konfirmasi Kata Sandi Baru
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi kata sandi baru"
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
          </button>
        </div>
      </form>
    </div>
  );
}
