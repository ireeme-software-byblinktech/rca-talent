import { isMockMode } from "@/lib/config/env";
import { MOCK_PASSWORD } from "@/lib/mock/data";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type {
  AuthSession,
  LoginCredentials,
  RegisterCompanyData,
  RegisterPendingResponse,
  RegisterStudentData,
  User,
} from "@/types";
import type { BackendAuthResponse, BackendUser } from "./mappers";
import { mapAuthResponse, mapUser } from "./mappers";

const USE_MOCK = isMockMode();

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const user = store.users.find(
        (u) => u.email === credentials.email && u.isActive
      );
      if (!user || credentials.password !== MOCK_PASSWORD) {
        throw new Error("Invalid email or password");
      }
      return {
        user,
        token: `mock-jwt-${user.id}`,
      };
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<BackendAuthResponse>("auth/login", {
      method: "POST",
      body: credentials,
      skipRefresh: true,
    });
    return mapAuthResponse(raw);
  },

  async registerStudent(data: RegisterStudentData): Promise<RegisterPendingResponse> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      if (store.users.some((u) => u.email === data.email)) {
        throw new Error("Email already registered");
      }
      const userId = generateId("user-student");
      const user: User = {
        id: userId,
        email: data.email,
        role: "student",
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      store.users.push(user);
      store.studentProfiles.push({
        userId,
        fullName: data.fullName,
        bio: "",
        skills: [],
        links: {},
        verificationStatus: "pending",
        cohortYear: data.cohortYear,
        availability: [],
        isVisible: true,
        updatedAt: new Date().toISOString(),
      });
      return {
        message: "Account created. Please verify your email before logging in.",
        email: data.email,
        requiresEmailVerification: true,
      };
    }
    const { apiClient } = await import("./client");
    return apiClient<RegisterPendingResponse>("auth/register/student", {
      method: "POST",
      body: data,
      skipRefresh: true,
    });
  },

  async registerCompany(data: RegisterCompanyData): Promise<RegisterPendingResponse> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      if (store.users.some((u) => u.email === data.email)) {
        throw new Error("Email already registered");
      }
      const userId = generateId("user-company");
      const user: User = {
        id: userId,
        email: data.email,
        role: "company",
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      store.users.push(user);
      store.companyProfiles.push({
        userId,
        companyName: data.companyName,
        description: "",
        industry: data.industry,
        verificationStatus: "pending",
        updatedAt: new Date().toISOString(),
      });
      return {
        message: "Account created. Please verify your email before logging in.",
        email: data.email,
        requiresEmailVerification: true,
      };
    }
    const { apiClient } = await import("./client");
    return apiClient<RegisterPendingResponse>("auth/register/company", {
      method: "POST",
      body: data,
      skipRefresh: true,
    });
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { apiClient } = await import("./client");
    return apiClient<{ message: string }>("auth/verify-email", {
      method: "POST",
      body: { token },
      skipRefresh: true,
    });
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const { apiClient } = await import("./client");
    return apiClient<{ message: string }>("auth/resend-verification", {
      method: "POST",
      body: { email },
      skipRefresh: true,
    });
  },

  async getMe(token: string): Promise<User> {
    if (USE_MOCK) {
      await simulateDelay(100);
      const store = getStore();
      const userId = token.replace("mock-jwt-", "");
      const user = store.users.find((u) => u.id === userId);
      if (!user) throw new Error("Unauthorized");
      return user;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<BackendUser>("auth/me", { token });
    return mapUser(raw);
  },

  async refresh(refreshToken: string): Promise<AuthSession> {
    const { apiClient } = await import("./client");
    const raw = await apiClient<BackendAuthResponse>("auth/refresh", {
      method: "POST",
      body: { refreshToken },
      skipRefresh: true,
    });
    return mapAuthResponse(raw);
  },

  async logout(): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay(100);
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>("auth/logout", { method: "POST" });
  },
};
