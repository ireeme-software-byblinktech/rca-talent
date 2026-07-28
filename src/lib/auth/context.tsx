"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import {
  setAuthToken,
  setOnTokensRefreshed,
  setRefreshToken,
} from "@/lib/api/client";
import type {
  AuthSession,
  LoginCredentials,
  RegisterCompanyData,
  RegisterPendingResponse,
  RegisterStudentData,
  User,
} from "@/types";
import { getDashboardPath } from "@/lib/auth/routes";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  registerStudent: (data: RegisterStudentData) => Promise<RegisterPendingResponse>;
  registerCompany: (data: RegisterCompanyData) => Promise<RegisterPendingResponse>;
  logout: (redirectTo?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "rca-talent-session";

function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setAuthToken(session.token);
    setRefreshToken(session.refreshToken ?? null);
  } else {
    localStorage.removeItem(SESSION_KEY);
    setAuthToken(null);
    setRefreshToken(null);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setOnTokensRefreshed((tokens) => {
      const session = getStoredSession();
      if (session) {
        const updated = {
          ...session,
          token: tokens.token,
          refreshToken: tokens.refreshToken,
        };
        storeSession(updated);
        setToken(tokens.token);
      }
    });

    const session = getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
      setAuthToken(session.token);
      setRefreshToken(session.refreshToken ?? null);
      authApi
        .getMe(session.token)
        .then((freshUser) => setUser(freshUser))
        .catch(() => {
          storeSession(null);
          setUser(null);
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    return () => setOnTokensRefreshed(null);
  }, []);

  const handleAuthSuccess = useCallback(
    (session: AuthSession) => {
      storeSession(session);
      setUser(session.user);
      setToken(session.token);

      router.push(getDashboardPath(session.user.role));
    },
    [router]
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const session = await authApi.login(credentials);
      handleAuthSuccess(session);
    },
    [handleAuthSuccess]
  );

  const registerStudent = useCallback(
    async (data: RegisterStudentData): Promise<RegisterPendingResponse> => {
      const result = await authApi.registerStudent(data);
      router.push(
        `/verify-email?email=${encodeURIComponent(result.email)}&pending=1`
      );
      return result;
    },
    [router]
  );

  const registerCompany = useCallback(
    async (data: RegisterCompanyData): Promise<RegisterPendingResponse> => {
      const result = await authApi.registerCompany(data);
      router.push(
        `/verify-email?email=${encodeURIComponent(result.email)}&pending=1`
      );
      return result;
    },
    [router]
  );

  const logout = useCallback(async (redirectTo = "/login") => {
    try {
      await authApi.logout();
    } catch {
      // Session may already be invalid after password change, etc.
    }
    storeSession(null);
    setUser(null);
    setToken(null);
    router.push(redirectTo);
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        registerStudent,
        registerCompany,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
