import { MOCK_PASSWORD } from "@/lib/mock/data";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type {
  AuthSession,
  LoginCredentials,
  RegisterCompanyData,
  RegisterStudentData,
  User,
} from "@/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

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
    return apiClient<AuthSession>("/auth/login", {
      method: "POST",
      body: credentials,
    });
  },

  async registerStudent(data: RegisterStudentData): Promise<AuthSession> {
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
      return { user, token: `mock-jwt-${userId}` };
    }
    const { apiClient } = await import("./client");
    return apiClient<AuthSession>("/auth/register/student", {
      method: "POST",
      body: data,
    });
  },

  async registerCompany(data: RegisterCompanyData): Promise<AuthSession> {
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
      return { user, token: `mock-jwt-${userId}` };
    }
    const { apiClient } = await import("./client");
    return apiClient<AuthSession>("/auth/register/company", {
      method: "POST",
      body: data,
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
    return apiClient<User>("/auth/me", { token });
  },

  async logout(): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay(100);
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>("/auth/logout", { method: "POST" });
  },
};
