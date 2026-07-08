import { paginate, type PaginatedResponse } from "@/lib/api/client";
import { isMockMode } from "@/lib/config/env";
import { mockAnalytics, type PlatformAnalytics } from "@/lib/mock/analytics";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type {
  AdminAuditLog,
  CompanyWithUser,
  PlatformMetrics,
  StudentWithUser,
  User,
} from "@/types";
import {
  mapCompanyWithUser,
  mapRoleToBackend,
  mapStudentWithUser,
  mapUser,
  type BackendUser,
} from "./mappers";

const USE_MOCK = isMockMode();

export const adminApi = {
  async getMetrics(): Promise<PlatformMetrics> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const students = store.studentProfiles;
      const requests = store.contactRequests;
      return {
        totalStudents: students.length,
        approvedStudents: students.filter((s) => s.verificationStatus === "approved").length,
        pendingStudents: students.filter((s) => s.verificationStatus === "pending").length,
        rejectedStudents: students.filter((s) => s.verificationStatus === "rejected").length,
        totalCompanies: store.companyProfiles.length,
        totalContactRequests: requests.length,
        requestsByStatus: {
          pending: requests.filter((r) => r.status === "pending").length,
          accepted: requests.filter((r) => r.status === "accepted").length,
          declined: requests.filter((r) => r.status === "declined").length,
        },
      };
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>("/admin/metrics");
    return {
      totalStudents: (raw.totalStudents as number) ?? 0,
      approvedStudents: (raw.approvedStudents as number) ?? 0,
      pendingStudents: (raw.pendingStudents as number) ?? 0,
      rejectedStudents: (raw.rejectedStudents as number) ?? 0,
      totalCompanies: (raw.totalCompanies as number) ?? 0,
      totalContactRequests: (raw.totalContactRequests as number) ?? 0,
      requestsByStatus: {
        pending: (raw.requestsByStatus as Record<string, number>)?.pending ?? 0,
        accepted: (raw.requestsByStatus as Record<string, number>)?.accepted ?? 0,
        declined:
          (raw.requestsByStatus as Record<string, number>)?.declined ??
          (raw.requestsByStatus as Record<string, number>)?.rejected ??
          0,
      },
    };
  },

  async getPendingStudents(): Promise<StudentWithUser[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      return store.studentProfiles
        .filter((p) => p.verificationStatus === "pending")
        .map((profile) => ({
          ...profile,
          user: store.users.find((u) => u.id === profile.userId)!,
        }));
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>("/admin/students/pending");
    return raw.map(mapStudentWithUser);
  },

  async approveStudent(_adminId: string, studentId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.studentProfiles.findIndex((p) => p.userId === studentId);
      if (idx === -1) throw new Error("Student not found");
      store.studentProfiles[idx].verificationStatus = "approved";
      store.studentProfiles[idx].rejectionReason = undefined;
      store.auditLogs.unshift({
        id: generateId("audit"),
        adminId: _adminId,
        action: "approved_student",
        targetType: "student",
        targetId: studentId,
        createdAt: new Date().toISOString(),
      });
      store.notifications.push({
        id: generateId("notif"),
        userId: studentId,
        title: "Profile approved",
        message: "Your profile has been verified and is now visible to companies.",
        read: false,
        createdAt: new Date().toISOString(),
        type: "verification",
      });
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/admin/students/${studentId}/verify`, {
      method: "POST",
      body: { status: "VERIFIED" },
    });
  },

  async rejectStudent(
    _adminId: string,
    studentId: string,
    reason: string
  ): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.studentProfiles.findIndex((p) => p.userId === studentId);
      if (idx === -1) throw new Error("Student not found");
      store.studentProfiles[idx].verificationStatus = "rejected";
      store.studentProfiles[idx].rejectionReason = reason;
      store.auditLogs.unshift({
        id: generateId("audit"),
        adminId: _adminId,
        action: "rejected_student",
        targetType: "student",
        targetId: studentId,
        reason,
        createdAt: new Date().toISOString(),
      });
      store.notifications.push({
        id: generateId("notif"),
        userId: studentId,
        title: "Profile rejected",
        message: `Your profile was not approved. Reason: ${reason}`,
        read: false,
        createdAt: new Date().toISOString(),
        type: "verification",
      });
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/admin/students/${studentId}/verify`, {
      method: "POST",
      body: { status: "REJECTED", reason },
    });
  },

  async getAllUsers(params: {
    query?: string;
    role?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResponse<User>> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const { query, role, page = 1, pageSize = 10 } = params;
      let users = store.users.filter((u) => u.role !== "admin");
      if (role) users = users.filter((u) => u.role === role);
      if (query) {
        const q = query.toLowerCase();
        users = users.filter((u) => u.email.toLowerCase().includes(q));
      }
      return paginate(users, page, pageSize);
    }
    const { apiClient } = await import("./client");
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set("query", params.query);
    if (params.role) searchParams.set("role", mapRoleToBackend(params.role as User["role"]));
    const qs = searchParams.toString();
    const raw = await apiClient<Record<string, unknown>[]>(
      `/admin/users${qs ? `?${qs}` : ""}`
    );
    const users = raw.map((u) => mapUser(u as unknown as BackendUser));
    return paginate(users, params.page ?? 1, params.pageSize ?? 50);
  },

  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.users.findIndex((u) => u.id === userId);
      if (idx === -1) throw new Error("User not found");
      store.users[idx].isActive = isActive;
      return store.users[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/admin/users/${userId}/status`,
      { method: "PATCH", body: { isActive } }
    );
    return mapUser(raw as unknown as BackendUser);
  },

  async getAuditLogs(params: {
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResponse<AdminAuditLog>> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const { page = 1, pageSize = 10 } = params;
      const sorted = [...store.auditLogs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return paginate(sorted, page, pageSize);
    }
    const { apiClient } = await import("./client");
    const limit = params.pageSize ?? 50;
    const raw = await apiClient<Record<string, unknown>[]>(
      `/admin/audit-logs?limit=${limit}`
    );
    const logs: AdminAuditLog[] = raw.map((entry) => ({
      id: entry.id as string,
      adminId: (entry.adminId as string) ?? "",
      action: (entry.action as string) ?? "",
      targetType: (entry.targetType as AdminAuditLog["targetType"]) ?? "student",
      targetId: (entry.targetId as string) ?? "",
      reason: entry.reason as string | undefined,
      createdAt: String(entry.createdAt ?? new Date().toISOString()),
    }));
    return paginate(logs, params.page ?? 1, limit);
  },

  async getAllStudents(): Promise<StudentWithUser[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      return store.studentProfiles.map((profile) => ({
        ...profile,
        user: store.users.find((u) => u.id === profile.userId)!,
      }));
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>("/admin/students");
    return raw.map(mapStudentWithUser);
  },

  async getAllCompanies(): Promise<CompanyWithUser[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      return store.companyProfiles.map((profile) => ({
        ...profile,
        user: store.users.find((u) => u.id === profile.userId)!,
      }));
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>("/admin/companies");
    return raw.map(mapCompanyWithUser);
  },

  async getAnalytics(): Promise<PlatformAnalytics> {
    if (USE_MOCK) {
      await simulateDelay();
      return mockAnalytics;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>("/admin/analytics");
    return {
      growth: Array.isArray(raw.growth) ? (raw.growth as PlatformAnalytics["growth"]) : [],
      topSkills: Array.isArray(raw.topSkills)
        ? (raw.topSkills as PlatformAnalytics["topSkills"])
        : [],
      cohortBreakdown: Array.isArray(raw.cohortBreakdown)
        ? (raw.cohortBreakdown as PlatformAnalytics["cohortBreakdown"])
        : [],
      recentActivity: Array.isArray(raw.recentActivity)
        ? (raw.recentActivity as PlatformAnalytics["recentActivity"])
        : [],
    };
  },

  async getPendingCompanies(): Promise<CompanyWithUser[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      return store.companyProfiles
        .filter((p) => p.verificationStatus === "pending")
        .map((profile) => ({
          ...profile,
          user: store.users.find((u) => u.id === profile.userId)!,
        }));
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>("/admin/companies/pending");
    return raw.map(mapCompanyWithUser);
  },

  async approveCompany(_adminId: string, companyId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.companyProfiles.findIndex((p) => p.userId === companyId);
      if (idx === -1) throw new Error("Company not found");
      store.companyProfiles[idx].verificationStatus = "approved";
      store.companyProfiles[idx].rejectionReason = undefined;
      store.auditLogs.unshift({
        id: generateId("audit"),
        adminId: _adminId,
        action: "approved_company",
        targetType: "company",
        targetId: companyId,
        createdAt: new Date().toISOString(),
      });
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/admin/companies/${companyId}/verify`, {
      method: "POST",
      body: { status: "VERIFIED" },
    });
  },

  async rejectCompany(
    _adminId: string,
    companyId: string,
    reason: string
  ): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.companyProfiles.findIndex((p) => p.userId === companyId);
      if (idx === -1) throw new Error("Company not found");
      store.companyProfiles[idx].verificationStatus = "rejected";
      store.companyProfiles[idx].rejectionReason = reason;
      store.auditLogs.unshift({
        id: generateId("audit"),
        adminId: _adminId,
        action: "rejected_company",
        targetType: "company",
        targetId: companyId,
        reason,
        createdAt: new Date().toISOString(),
      });
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/admin/companies/${companyId}/verify`, {
      method: "POST",
      body: { status: "REJECTED", reason },
    });
  },

  async getContentReports() {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().contentReports;
    }
    // Backend moderation endpoint not yet implemented
    return [] as import("@/types").ContentReport[];
  },

  async resolveReport(reportId: string, status: "resolved" | "dismissed"): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.contentReports.findIndex((r) => r.id === reportId);
      if (idx !== -1) store.contentReports[idx].status = status;
      return;
    }
    // Backend moderation endpoint not yet implemented
    void reportId;
    void status;
  },

  async getPlatformReport() {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const students = store.studentProfiles;
      const companies = store.companyProfiles;
      const requests = store.contactRequests;
      return {
        generatedAt: new Date().toISOString(),
        students: {
          total: students.length,
          approved: students.filter((s) => s.verificationStatus === "approved").length,
          pending: students.filter((s) => s.verificationStatus === "pending").length,
        },
        companies: {
          total: companies.length,
          approved: companies.filter((c) => c.verificationStatus === "approved").length,
          pending: companies.filter((c) => c.verificationStatus === "pending").length,
        },
        contactRequests: {
          total: requests.length,
          accepted: requests.filter((r) => r.status === "accepted").length,
          conversionRate: requests.length
            ? Math.round((requests.filter((r) => r.status === "accepted").length / requests.length) * 100)
            : 0,
        },
        jobs: { total: store.jobPostings.length, open: store.jobPostings.filter((j) => j.status === "open").length },
        interviews: store.interviewInvitations.length,
        messages: store.messages.length,
        moderationPending: store.contentReports.filter((r) => r.status === "pending").length,
      };
    }
    const { apiClient } = await import("./client");
    return apiClient<Record<string, unknown>>("/admin/reports/platform");
  },
};
