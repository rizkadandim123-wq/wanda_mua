import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function AdminGuard() {
  const { isAdmin, isConfigured, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F4] flex flex-col items-center justify-center gap-3 text-[#8F454B]">
        <Loader2 className="w-7 h-7 animate-spin text-[#B96B78]" />
        <p className="text-sm">Memeriksa sesi admin...</p>
      </div>
    );
  }

  if (!isConfigured || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
