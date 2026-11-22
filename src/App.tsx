import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastProvider } from './components/common/ToastProvider';
import { AuthProvider } from './hooks/useAuth';
import { PublicHomePage } from './pages/PublicHomePage';

const AdminGuard = lazy(() =>
  import('./components/admin/AdminGuard').then((m) => ({ default: m.AdminGuard }))
);
const AdminLayout = lazy(() =>
  import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const PreviewPage = lazy(() =>
  import('./pages/PreviewPage').then((m) => ({ default: m.PreviewPage }))
);
const AboutEditorPage = lazy(() =>
  import('./pages/admin/AboutEditorPage').then((m) => ({ default: m.AboutEditorPage }))
);
const AccountPage = lazy(() =>
  import('./pages/admin/AccountPage').then((m) => ({ default: m.AccountPage }))
);
const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AppearanceEditorPage = lazy(() =>
  import('./pages/admin/AppearanceEditorPage').then((m) => ({ default: m.AppearanceEditorPage }))
);
const ContactEditorPage = lazy(() =>
  import('./pages/admin/ContactEditorPage').then((m) => ({ default: m.ContactEditorPage }))
);
const FeedbackEditorPage = lazy(() =>
  import('./pages/admin/FeedbackEditorPage').then((m) => ({ default: m.FeedbackEditorPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const HeroEditorPage = lazy(() =>
  import('./pages/admin/HeroEditorPage').then((m) => ({ default: m.HeroEditorPage }))
);
const IdentityEditorPage = lazy(() =>
  import('./pages/admin/IdentityEditorPage').then((m) => ({ default: m.IdentityEditorPage }))
);
const PortfolioEditorPage = lazy(() =>
  import('./pages/admin/PortfolioEditorPage').then((m) => ({ default: m.PortfolioEditorPage }))
);
const SeoEditorPage = lazy(() =>
  import('./pages/admin/SeoEditorPage').then((m) => ({ default: m.SeoEditorPage }))
);
const ServicesEditorPage = lazy(() =>
  import('./pages/admin/ServicesEditorPage').then((m) => ({ default: m.ServicesEditorPage }))
);
const TestimonialsEditorPage = lazy(() =>
  import('./pages/admin/TestimonialsEditorPage').then((m) => ({
    default: m.TestimonialsEditorPage,
  }))
);

function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFF9F5] text-[#8F454B] text-sm">
          Memuat halaman...
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicHomePage />,
  },
  {
    path: '/admin/login',
    element: (
      <LazyRoute>
        <AdminLoginPage />
      </LazyRoute>
    ),
  },
  {
    element: (
      <LazyRoute>
        <AdminGuard />
      </LazyRoute>
    ),
    children: [
      {
        path: '/preview',
        element: (
          <LazyRoute>
            <PreviewPage />
          </LazyRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <LazyRoute>
            <AdminLayout />
          </LazyRoute>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'identity', element: <IdentityEditorPage /> },
          { path: 'hero', element: <HeroEditorPage /> },
          { path: 'about', element: <AboutEditorPage /> },
          { path: 'services', element: <ServicesEditorPage /> },
          { path: 'portfolio', element: <PortfolioEditorPage /> },
          { path: 'testimonials', element: <TestimonialsEditorPage /> },
          { path: 'contact', element: <ContactEditorPage /> },
          { path: 'feedback', element: <FeedbackEditorPage /> },
          { path: 'appearance', element: <AppearanceEditorPage /> },
          { path: 'seo', element: <SeoEditorPage /> },
          { path: 'account', element: <AccountPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <LazyRoute>
        <NotFoundPage />
      </LazyRoute>
    ),
  },
]);

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
