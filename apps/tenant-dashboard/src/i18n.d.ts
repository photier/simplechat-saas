import 'react-i18next';
import enDashboard from './locales/en/dashboard.json';
import enCommon from './locales/en/common.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'dashboard';
    resources: {
      dashboard: typeof enDashboard;
      common: typeof enCommon;
    };
  }
}
