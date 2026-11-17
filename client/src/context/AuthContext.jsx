import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getStoredToken, setStoredToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication on app load
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const storedToken = getStoredToken();

      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (isMounted && res.success && res.admin) {
            setAdmin(res.admin);
            setToken(storedToken);
            setLoading(false);
            return;
          }
        } catch {
          // Access token might be expired; attempt refresh below
        }
      }

      // Attempt silent refresh via HTTP-only cookie
      try {
        const refreshedToken = await api.auth.refresh();
        if (refreshedToken) {
          const res = await api.auth.getMe();
          if (isMounted && res.success && res.admin) {
            setAdmin(res.admin);
            setToken(refreshedToken);
          }
        }
      } catch {
        if (isMounted) {
          setStoredToken(null);
          setAdmin(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen to token refresh and expiration events from the api service
    const handleAuthExpired = () => {
      if (isMounted) {
        setStoredToken(null);
        setAdmin(null);
        setToken(null);
      }
    };

    const handleTokenRefreshed = (e) => {
      if (isMounted && e.detail?.token) {
        setToken(e.detail.token);
        if (e.detail.admin) {
          setAdmin(e.detail.admin);
        }
      }
    };

    window.addEventListener('noolz:auth-expired', handleAuthExpired);
    window.addEventListener('noolz:token-refreshed', handleTokenRefreshed);

    return () => {
      isMounted = false;
      window.removeEventListener('noolz:auth-expired', handleAuthExpired);
      window.removeEventListener('noolz:token-refreshed', handleTokenRefreshed);
    };
  }, []);

  const login = useCallback(async (identifier, password) => {
    const res = await api.auth.login(identifier, password);
    if (res.success && res.accessToken) {
      setStoredToken(res.accessToken);
      setToken(res.accessToken);
      setAdmin(res.admin);
      return res.admin;
    }
    throw new Error(res.message || 'Login failed');
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout API notification failed:', err.message);
    } finally {
      setStoredToken(null);
      setToken(null);
      setAdmin(null);
    }
  }, []);

  const value = {
    admin,
    token,
    isAuthenticated: Boolean(token && admin && admin.role === 'admin'),
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
