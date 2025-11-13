import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes';
import './i18n'; // Initialize i18n

const { BASE_URL } = import.meta.env;

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="vite-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <HelmetProvider>
        <LoadingBarContainer>
          <BrowserRouter basename={BASE_URL}>
            <AuthProvider>
              <Toaster position="top-right" />
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </LoadingBarContainer>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
