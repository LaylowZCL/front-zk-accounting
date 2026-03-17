import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, ApiUser, authLogout, authMe, clearAuth, getToken, getUser, isCookieAuth, setToken, setUnauthorizedHandler, setUser } from '@/lib/api';

interface AuthContextValue {
  user: ApiUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, user: ApiUser) => void;
  refreshUser: () => Promise<ApiUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const usesCookieAuth = isCookieAuth();
  const [token, setTokenState] = useState<string | null>(getToken());
  const [user, setUserState] = useState<ApiUser | null>(getUser());
  const [isLoading, setIsLoading] = useState(Boolean(getToken()) || usesCookieAuth);

  const setSession = useCallback((nextToken: string, nextUser: ApiUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setTokenState(usesCookieAuth ? null : nextToken);
    setUserState(nextUser);
  }, [usesCookieAuth]);

  const resetSession = useCallback(() => {
    clearAuth();
    setTokenState(null);
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authMe();
      setUser(me);
      setUserState(me);
      return me;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getToken() || usesCookieAuth) {
        await authLogout();
      }
    } catch {
      // Ignore network errors on logout and clear local session anyway.
    } finally {
      resetSession();
    }
  }, [resetSession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      resetSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [resetSession]);

  useEffect(() => {
    const bootstrap = async () => {
      const existingToken = getToken();
      if (!existingToken && !usesCookieAuth) {
        setIsLoading(false);
        return;
      }

      if (user) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await authMe();
        setUser(me);
        setUserState(me);
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          resetSession();
        }
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [resetSession, user]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean((usesCookieAuth ? user : token && user)),
      isLoading,
      setSession,
      refreshUser,
      logout,
    }),
    [isLoading, logout, refreshUser, setSession, token, user, usesCookieAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
