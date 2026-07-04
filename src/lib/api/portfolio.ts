import { getStore, simulateDelay } from "@/lib/mock/store";
import type {
  PortfolioConfig,
  PortfolioSections,
  PortfolioTheme,
  PublicPortfolio,
} from "@/types";
import { certificationsApi } from "./certifications";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export interface UpdatePortfolioData {
  slug?: string;
  tagline?: string;
  theme?: PortfolioTheme;
  sections?: Partial<PortfolioSections>;
  projectOrder?: string[];
  certificationOrder?: string[];
  achievementOrder?: string[];
  isPublished?: boolean;
}

function defaultConfig(studentId: string): PortfolioConfig {
  return {
    studentId,
    slug: "",
    tagline: "",
    theme: "modern",
    sections: {
      about: true,
      skills: true,
      projects: true,
      certifications: true,
      achievements: true,
    },
    projectOrder: [],
    certificationOrder: [],
    achievementOrder: [],
    isPublished: false,
    updatedAt: new Date().toISOString(),
  };
}

export const portfolioApi = {
  async getConfig(studentId: string): Promise<PortfolioConfig> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const existing = store.portfolioConfigs.find((c) => c.studentId === studentId);
      if (existing) {
        const certs = store.certifications.filter((c) => c.studentId === studentId);
        const achs = store.achievements.filter((a) => a.studentId === studentId);
        return {
          ...existing,
          certificationOrder: existing.certificationOrder?.length
            ? existing.certificationOrder
            : certs.map((c) => c.id),
          achievementOrder: existing.achievementOrder?.length
            ? existing.achievementOrder
            : achs.map((a) => a.id),
        };
      }
      const projects = store.projects.filter((p) => p.studentId === studentId);
      const profile = store.studentProfiles.find((p) => p.userId === studentId);
      const slug = profile?.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ?? studentId;
      const config = {
        ...defaultConfig(studentId),
        slug,
        projectOrder: projects.map((p) => p.id),
        certificationOrder: store.certifications
          .filter((c) => c.studentId === studentId)
          .map((c) => c.id),
        achievementOrder: store.achievements
          .filter((a) => a.studentId === studentId)
          .map((a) => a.id),
      };
      store.portfolioConfigs.push(config);
      return config;
    }
    const { apiClient } = await import("./client");
    return apiClient<PortfolioConfig>(`/students/${studentId}/portfolio`);
  },

  async updateConfig(studentId: string, data: UpdatePortfolioData): Promise<PortfolioConfig> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      let idx = store.portfolioConfigs.findIndex((c) => c.studentId === studentId);
      if (idx === -1) {
        store.portfolioConfigs.push(defaultConfig(studentId));
        idx = store.portfolioConfigs.length - 1;
      }
      if (data.slug) {
        const taken = store.portfolioConfigs.some(
          (c) => c.studentId !== studentId && c.slug === data.slug
        );
        if (taken) throw new Error("This portfolio URL is already taken");
      }
      store.portfolioConfigs[idx] = {
        ...store.portfolioConfigs[idx],
        ...data,
        sections: data.sections
          ? { ...store.portfolioConfigs[idx].sections, ...data.sections }
          : store.portfolioConfigs[idx].sections,
        updatedAt: new Date().toISOString(),
      };
      return store.portfolioConfigs[idx];
    }
    const { apiClient } = await import("./client");
    return apiClient<PortfolioConfig>(`/students/${studentId}/portfolio`, {
      method: "PATCH",
      body: data,
    });
  },

  async getPublicBySlug(slug: string): Promise<PublicPortfolio | null> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const config = store.portfolioConfigs.find(
        (c) => c.slug === slug && c.isPublished
      );
      if (!config) return null;
      const profile = store.studentProfiles.find((p) => p.userId === config.studentId);
      if (!profile || profile.verificationStatus !== "approved") return null;

      const allProjects = store.projects.filter((p) => p.studentId === config.studentId);
      const ordered = config.projectOrder.length
        ? config.projectOrder
            .map((id) => allProjects.find((p) => p.id === id))
            .filter(Boolean)
        : allProjects;
      const remaining = allProjects.filter((p) => !config.projectOrder.includes(p.id));
      const projects = [...(ordered as typeof allProjects), ...remaining];

      const certifications = await certificationsApi.getForStudent(config.studentId);
      const achievements = await certificationsApi.getAchievements(config.studentId);

      const orderByIds = <T extends { id: string }>(items: T[], order: string[]) => {
        const ids = order.length ? order : items.map((i) => i.id);
        const sorted = ids
          .map((id) => items.find((i) => i.id === id))
          .filter(Boolean) as T[];
        return [...sorted, ...items.filter((i) => !ids.includes(i.id))];
      };

      return {
        config,
        profile,
        projects,
        certifications: orderByIds(certifications, config.certificationOrder ?? []),
        achievements: orderByIds(achievements, config.achievementOrder ?? []),
      };
    }
    const { apiClient } = await import("./client");
    return apiClient<PublicPortfolio | null>(`/portfolio/${slug}`);
  },

  async isSlugAvailable(slug: string, studentId: string): Promise<boolean> {
    if (USE_MOCK) {
      await simulateDelay();
      if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3) return false;
      return !getStore().portfolioConfigs.some(
        (c) => c.slug === slug && c.studentId !== studentId
      );
    }
    const { apiClient } = await import("./client");
    return apiClient<boolean>(
      `/portfolio/slug-available?slug=${encodeURIComponent(slug)}&studentId=${studentId}`
    );
  },
};
