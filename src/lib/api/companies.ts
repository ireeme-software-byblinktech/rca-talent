import { isMockMode } from "@/lib/config/env";
import { getStore, simulateDelay } from "@/lib/mock/store";
import type { CompanyProfile, CompanyWithUser } from "@/types";
import {
  mapCompanyProfile,
  mapCompanyUpdateToBackend,
  mapCompanyWithUser,
} from "./mappers";

const USE_MOCK = isMockMode();

export interface UpdateCompanyProfileData {
  companyName?: string;
  logoUrl?: string;
  description?: string;
  industry?: string;
  website?: string;
}

export const companiesApi = {
  async getProfile(userId: string): Promise<CompanyProfile | null> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      return store.companyProfiles.find((p) => p.userId === userId) ?? null;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/companies/${userId}/profile`
    );
    return mapCompanyProfile(raw);
  },

  async updateProfile(
    userId: string,
    data: UpdateCompanyProfileData
  ): Promise<CompanyProfile> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.companyProfiles.findIndex((p) => p.userId === userId);
      if (idx === -1) throw new Error("Profile not found");
      store.companyProfiles[idx] = {
        ...store.companyProfiles[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return store.companyProfiles[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/companies/${userId}/profile`,
      {
        method: "PATCH",
        body: mapCompanyUpdateToBackend(data as Record<string, unknown>),
      }
    );
    return mapCompanyProfile(raw);
  },

  async getCompanyWithUser(userId: string): Promise<CompanyWithUser | null> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const profile = store.companyProfiles.find((p) => p.userId === userId);
      if (!profile) return null;
      const user = store.users.find((u) => u.id === userId);
      if (!user) return null;
      return { ...profile, user };
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(`/companies/${userId}`);
    return mapCompanyWithUser(raw);
  },
};
