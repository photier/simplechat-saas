import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';

interface User {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  subdomain: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('[AuthContext] fetchUser - token:', token ? 'exists' : 'null'); // DEBUG
      if (token) {
        console.log('[AuthContext] Calling getMe()...'); // DEBUG
        const userData = await authService.getMe();
        console.log('[AuthContext] User data:', userData); // DEBUG
        setUser(userData);
      } else {
        console.log('[AuthContext] No token found'); // DEBUG
      }
    } catch (error) {
      console.error('[AuthContext] fetchUser error:', error); // DEBUG
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
      console.log('[AuthContext] Loading complete, user:', user); // DEBUG
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.tenant);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refetchUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
