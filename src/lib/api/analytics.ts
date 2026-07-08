import { isMockMode } from "@/lib/config/env";
import { getStore, simulateDelay } from "@/lib/mock/store";
import type { CareerAnalytics, RecruitmentMetrics } from "@/types";
import { studentsApi } from "./students";
import { contactRequestsApi } from "./contactRequests";

const USE_MOCK = isMockMode();

export const analyticsApi = {
  async getStudentCareerAnalytics(userId: string): Promise<CareerAnalytics> {
    if (USE_MOCK) {
      await simulateDelay();
      const profile = await studentsApi.getProfile(userId);
      const projects = await studentsApi.getProjects(userId);
      const requests = await contactRequestsApi.getForStudent(userId);
      const accepted = requests.filter((r) => r.status === "accepted").length;
      const total = requests.length || 1;
      return {
        profileViews: [
          { week: "W1", views: 0 },
          { week: "W2", views: 0 },
          { week: "W3", views: 0 },
          { week: "W4", views: 0 },
          { week: "W5", views: 0 },
          { week: "W6", views: 0 },
        ],
        weeklyContactRequests: [
          { week: "W1", count: 0 },
          { week: "W2", count: 0 },
          { week: "W3", count: 0 },
          { week: "W4", count: 0 },
          { week: "W5", count: 0 },
          { week: "W6", count: requests.filter((r) => r.status === "pending").length },
        ],
        totalContactRequests: total,
        contactRequestRate: Math.round((total / 6) * 10) / 10,
        profileCompleteness: profile
          ? studentsApi.getProfileCompleteness(profile, projects.length)
          : 0,
        topSkills: profile?.skills.slice(0, 5) ?? [],
        responseRate: Math.round((accepted / total) * 100),
      };
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(`/students/${userId}/analytics`);
    return {
      profileViews: Array.isArray(raw.profileViews)
        ? (raw.profileViews as CareerAnalytics["profileViews"])
        : [],
      weeklyContactRequests: Array.isArray(raw.weeklyContactRequests)
        ? (raw.weeklyContactRequests as CareerAnalytics["weeklyContactRequests"])
        : [],
      totalContactRequests: (raw.totalContactRequests as number) ?? 0,
      contactRequestRate: (raw.contactRequestRate as number) ?? 0,
      profileCompleteness: (raw.profileCompleteness as number) ?? 0,
      topSkills: Array.isArray(raw.topSkills)
        ? (raw.topSkills as string[])
        : [],
      responseRate: (raw.responseRate as number) ?? 0,
    };
  },

  async getRecruitmentMetrics(companyId: string): Promise<RecruitmentMetrics> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const jobs = store.jobPostings.filter((j) => j.companyId === companyId);
      const requests = store.contactRequests.filter((r) => r.companyId === companyId);
      const interviews = store.interviewInvitations.filter((i) => i.companyId === companyId);
      return {
        openJobs: jobs.filter((j) => j.status === "open").length,
        totalApplications: requests.length,
        interviewsScheduled: interviews.filter((i) => i.status === "accepted" || i.status === "pending").length,
        hires: requests.filter((r) => r.status === "accepted").length,
        bookmarkedCandidates: 0,
      };
    }
    const { apiClient } = await import("./client");
    return apiClient<RecruitmentMetrics>(`/companies/${companyId}/recruitment-metrics`);
  },
};
