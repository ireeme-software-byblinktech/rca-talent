import { paginate, type PaginatedResponse } from "@/lib/api/client";
import { mockAnalytics, type PlatformAnalytics } from "@/lib/mock/analytics";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type {
  AdminAuditLog,
  CompanyWithUser,
  PlatformMetrics,
  StudentWithUser,
  User,
} from "@/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

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
    return apiClient<PlatformMetrics>("/admin/metrics");
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
    return apiClient<StudentWithUser[]>("/admin/students/pending");
  },

  async approveStudent(adminId: string, studentId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.studentProfiles.findIndex((p) => p.userId === studentId);
      if (idx === -1) throw new Error("Student not found");
      store.studentProfiles[idx].verificationStatus = "approved";
      store.studentProfiles[idx].rejectionReason = undefined;
      store.auditLogs.unshift({
        id: generateId("audit"),
        adminId,
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
    return apiClient<void>(`/admin/students/${studentId}/approve`, {
      method: "POST",
    });
  },

  async rejectStudent(
    adminId: string,
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
        adminId,
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
    return apiClient<void>(`/admin/students/${studentId}/reject`, {
      method: "POST",
      body: { reason },
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
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
    return apiClient<PaginatedResponse<User>>(
      `/admin/users?${searchParams}`
    );
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
    return apiClient<User>(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: { isActive },
    });
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
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
    return apiClient<PaginatedResponse<AdminAuditLog>>(
      `/admin/audit-logs?${searchParams}`
    );
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
    return apiClient<StudentWithUser[]>("/admin/students");
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
    return apiClient<CompanyWithUser[]>("/admin/companies");
  },

  async getAnalytics(): Promise<PlatformAnalytics> {
    if (USE_MOCK) {
      await simulateDelay();
      return mockAnalytics;
    }
    const { apiClient } = await import("./client");
    return apiClient<PlatformAnalytics>("/admin/analytics");
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
    return apiClient<CompanyWithUser[]>("/admin/companies/pending");
  },

  async approveCompany(adminId: string, companyId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.companyProfiles.findIndex((p) => p.userId === companyId);
      if (idx === -1) throw new Error("Company not found");
      store.companyProfiles[idx].verificationStatus = "approved";
      store.companyProfiles[idx].rejectionReason = undefined;
      store.auditLogs.unshift({
        id: generateId("audit"),
        adminId,
        action: "approved_company",
        targetType: "company",
        targetId: companyId,
        createdAt: new Date().toISOString(),
      });
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/admin/companies/${companyId}/approve`, { method: "POST" });
  },

  async rejectCompany(adminId: string, companyId: string, reason: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.companyProfiles.findIndex((p) => p.userId === companyId);
      if (idx === -1) throw new Error("Company not found");
      store.companyProfiles[idx].verificationStatus = "rejected";
      store.companyProfiles[idx].rejectionReason = reason;
      store.auditLogs.unshift({
        id: generateId("audit"),
        adminId,
        action: "rejected_company",
        targetType: "company",
        targetId: companyId,
        reason,
        createdAt: new Date().toISOString(),
      });
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/admin/companies/${companyId}/reject`, {
      method: "POST",
      body: { reason },
    });
  },

  async getContentReports() {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().contentReports;
    }
    const { apiClient } = await import("./client");
    return apiClient<import("@/types").ContentReport[]>("/admin/moderation");
  },

  async resolveReport(reportId: string, status: "resolved" | "dismissed"): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.contentReports.findIndex((r) => r.id === reportId);
      if (idx !== -1) store.contentReports[idx].status = status;
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/admin/moderation/${reportId}`, {
      method: "PATCH",
      body: { status },
    });
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
