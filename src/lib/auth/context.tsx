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
import { setAuthToken } from "@/lib/api/client";
import type {
  AuthSession,
  LoginCredentials,
  RegisterCompanyData,
  RegisterStudentData,
  User,
  UserRole,
} from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  registerStudent: (data: RegisterStudentData) => Promise<void>;
  registerCompany: (data: RegisterCompanyData) => Promise<void>;
  logout: () => Promise<void>;
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
  } else {
    localStorage.removeItem(SESSION_KEY);
    setAuthToken(null);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
      setAuthToken(session.token);
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
  }, []);

  const handleAuthSuccess = useCallback(
    (session: AuthSession) => {
      storeSession(session);
      setUser(session.user);
      setToken(session.token);

      const roleRoutes: Record<UserRole, string> = {
        student: "/student",
        company: "/company",
        admin: "/admin",
      };
      router.push(roleRoutes[session.user.role]);
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
    async (data: RegisterStudentData) => {
      const session = await authApi.registerStudent(data);
      handleAuthSuccess(session);
    },
    [handleAuthSuccess]
  );

  const registerCompany = useCallback(
    async (data: RegisterCompanyData) => {
      const session = await authApi.registerCompany(data);
      handleAuthSuccess(session);
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    storeSession(null);
    setUser(null);
    setToken(null);
    router.push("/login");
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
