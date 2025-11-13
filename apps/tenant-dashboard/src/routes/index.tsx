import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Layout8 } from '@/components/layouts/layout-8';
import { Layout8Page } from '@/pages/layout-8/page';
import { Layout8SettingsPage } from '@/pages/layout-8/settings/page';
import { Layout8ProfilePage } from '@/pages/layout-8/profile/page';
import LoginPage from '@/pages/LoginPage';
import SetupSubdomainPage from '@/pages/SetupSubdomainPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Redirect to subdomain setup if still on temp subdomain (but not if already on setup page)
  if (user.subdomain?.startsWith('temp_') && location.pathname !== '/setup-subdomain') {
    return <Navigate to="/setup-subdomain" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Subdomain setup (protected but no layout) */}
        <Route
          path="/setup-subdomain"
          element={
            <ProtectedRoute>
              <SetupSubdomainPage />
            </ProtectedRoute>
          }
        />

        {/* Protected routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout8 />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Layout8Page />} />
          <Route path="/settings" element={<Layout8SettingsPage />} />
          <Route path="/profile" element={<Layout8ProfilePage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
