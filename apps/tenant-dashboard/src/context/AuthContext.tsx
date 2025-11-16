import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import i18n from '@/i18n/config';

interface User {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  subdomain: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  sidebarPosition?: string;
  dataRetention?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<User | null>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (): Promise<User | null> => {
    try {
      // HttpOnly cookie is automatically sent by browser (no manual handling needed)
      console.log('[AuthContext] Fetching user data from /auth/me...');
      const userData = await authService.getMe();
      console.log('[AuthContext] User data fetched successfully:', userData);

      // Sync user language preference with i18n (production-grade)
      if (userData.language && (userData.language === 'en' || userData.language === 'tr')) {
        console.log('[AuthContext] Syncing language from backend:', userData.language);
        i18n.changeLanguage(userData.language);
      }

      setUser(userData);
      return userData; // Return user data so caller can use it immediately
    } catch (error: any) {
      // Cookie invalid/expired - backend will clear it
      console.error('[AuthContext] Failed to fetch user:', error.response?.data || error.message);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.tenant);
  };

  const logout = async () => {
    try {
      // Clear user state immediately (optimistic update)
      setUser(null);

      // Call backend to clear HttpOnly cookie
      await authService.logout();
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      // Still redirect even if backend call fails
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetchUser: fetchUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
