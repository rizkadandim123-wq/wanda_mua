import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiJson } from '../lib/api';

export interface AdminProfile {
  id: string;
  username: string;
  display_name: string;
  role: 'owner' | 'admin';
}

interface SessionResponse {
  isConfigured: boolean;
  hasAdmin: boolean;
  admin: AdminProfile | null;
}

interface AuthContextValue {
  admin: AdminProfile | null;
  isAdmin: boolean;
  hasAdmin: boolean;
  isConfigured: boolean;
  loading: boolean;
  authError: string | null;
  refreshSession: () => Promise<void>;
  setupFirstAdmin: (
    username: string,
    password: string,
    displayName?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  signIn: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [hasAdmin, setHasAdmin] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const data = await apiJson<SessionResponse>('/api/auth/session');
      setIsConfigured(data.isConfigured);
      setHasAdmin(data.hasAdmin);
      setAdmin(data.admin);
      setAuthError(null);
    } catch (err) {
      setAdmin(null);
      setAuthError(err instanceof Error ? err.message : 'Gagal memeriksa sesi admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const setupFirstAdmin = useCallback(
    async (
      username: string,
      password: string,
      displayName?: string
    ): Promise<{ ok: boolean; error?: string }> => {
      try {
        setAuthError(null);
        const res = await apiJson<{ admin: AdminProfile }>('/api/auth/setup', {
          method: 'POST',
          body: JSON.stringify({
            username: username.trim(),
            password,
            displayName: displayName?.trim() || 'Admin Niwayuliana',
          }),
        });
        setAdmin(res.admin);
        setHasAdmin(true);
        setIsConfigured(true);
        return { ok: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal membuat akun admin pertama.';
        setAuthError(msg);
        return { ok: false, error: msg };
      }
    },
    []
  );

  const signIn = useCallback(
    async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        setAuthError(null);
        const res = await apiJson<{ admin: AdminProfile }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        });
        setAdmin(res.admin);
        setHasAdmin(true);
        return { ok: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Username atau kata sandi tidak sesuai.';
        setAuthError(msg);
        return { ok: false, error: msg };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await apiJson<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
    } finally {
      setAdmin(null);
      setAuthError(null);
    }
  }, []);

  const updatePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string
    ): Promise<{ ok: boolean; error?: string }> => {
      try {
        await apiJson<{ ok: boolean }>('/api/auth/password', {
          method: 'POST',
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Gagal memperbarui kata sandi.',
        };
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAdmin: Boolean(admin),
        hasAdmin,
        isConfigured,
        loading,
        authError,
        refreshSession,
        setupFirstAdmin,
        signIn,
        signOut,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }
  return ctx;
}
