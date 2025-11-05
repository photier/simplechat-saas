import { Route, Routes, Navigate, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { Layout8 } from '@/components/layouts/layout-8';
import { Layout8Page } from '@/pages/layout-8/page';
import { Layout8WebPage } from '@/pages/layout-8/web/page';
import { Layout8PremiumPage } from '@/pages/layout-8/premium/page';
import { Layout8SettingsPage } from '@/pages/layout-8/settings/page';

export function AppRoutingSetup() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout8 />}>
          <Route path="/" element={<Layout8Page />} />
          <Route path="/web" element={<Layout8WebPage />} />
          <Route path="/premium" element={<Layout8PremiumPage />} />
          <Route path="/settings" element={<Layout8SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
