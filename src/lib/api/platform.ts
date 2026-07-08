import { isMockMode } from "@/lib/config/env";
import { getStore, simulateDelay } from "@/lib/mock/store";

const USE_MOCK = isMockMode();

export interface PublicPlatformStats {
  totalStudents: number;
  verifiedStudents: number;
  totalCompanies: number;
  verifiedCompanies: number;
  totalProjects: number;
  totalContactRequests: number;
  verifiedProfileRate: number;
}

export const EMPTY_PLATFORM_STATS: PublicPlatformStats = {
  totalStudents: 0,
  verifiedStudents: 0,
  totalCompanies: 0,
  verifiedCompanies: 0,
  totalProjects: 0,
  totalContactRequests: 0,
  verifiedProfileRate: 0,
};

export const platformApi = {
  async getPublicStats(): Promise<PublicPlatformStats> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const totalStudents = store.studentProfiles.length;
      const verifiedStudents = store.studentProfiles.filter(
        (s) => s.verificationStatus === "approved"
      ).length;
      const totalCompanies = store.companyProfiles.length;
      const verifiedCompanies = store.companyProfiles.filter(
        (c) => c.verificationStatus === "approved"
      ).length;
      const totalProjects = store.projects.length;
      const totalProfiles = totalStudents + totalCompanies;
      const verifiedProfileRate =
        totalProfiles > 0
          ? Math.round(
              ((verifiedStudents + verifiedCompanies) / totalProfiles) * 100
            )
          : 0;

      return {
        totalStudents,
        verifiedStudents,
        totalCompanies,
        verifiedCompanies,
        totalProjects,
        totalContactRequests: store.contactRequests.filter(
          (r) => r.status === "accepted"
        ).length,
        verifiedProfileRate,
      };
    }

    try {
      const { apiClient } = await import("./client");
      return await apiClient<PublicPlatformStats>("/platform/stats");
    } catch {
      return EMPTY_PLATFORM_STATS;
    }
  },
};
