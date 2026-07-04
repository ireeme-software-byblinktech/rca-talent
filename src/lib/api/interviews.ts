import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type { InterviewInvitation, InterviewStatus, JobPosting } from "@/types";
import type { CompanyProfile, StudentProfile, User } from "@/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export interface InterviewWithDetails extends InterviewInvitation {
  company?: CompanyProfile & { user: User };
  student?: StudentProfile & { user: User };
  job?: JobPosting;
}

export interface CreateInterviewData {
  studentId: string;
  jobId?: string;
  scheduledAt: string;
  location: string;
  message: string;
}

export const interviewsApi = {
  async getForCompany(companyId: string): Promise<InterviewWithDetails[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return enrich(getStore().interviewInvitations.filter((i) => i.companyId === companyId));
    }
    const { apiClient } = await import("./client");
    return apiClient<InterviewWithDetails[]>(`/interviews/company/${companyId}`);
  },

  async getForStudent(studentId: string): Promise<InterviewWithDetails[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return enrich(getStore().interviewInvitations.filter((i) => i.studentId === studentId));
    }
    const { apiClient } = await import("./client");
    return apiClient<InterviewWithDetails[]>(`/interviews/student/${studentId}`);
  },

  async create(companyId: string, data: CreateInterviewData): Promise<InterviewInvitation> {
    if (USE_MOCK) {
      await simulateDelay();
      const inv: InterviewInvitation = {
        id: generateId("int"),
        companyId,
        ...data,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      getStore().interviewInvitations.push(inv);
      return inv;
    }
    const { apiClient } = await import("./client");
    return apiClient<InterviewInvitation>("/interviews", {
      method: "POST",
      body: { ...data, companyId },
    });
  },

  async respond(
    invitationId: string,
    studentId: string,
    status: "accepted" | "declined"
  ): Promise<InterviewInvitation> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.interviewInvitations.findIndex(
        (i) => i.id === invitationId && i.studentId === studentId
      );
      if (idx === -1) throw new Error("Invitation not found");
      store.interviewInvitations[idx].status = status;
      return store.interviewInvitations[idx];
    }
    const { apiClient } = await import("./client");
    return apiClient<InterviewInvitation>(`/interviews/${invitationId}/respond`, {
      method: "POST",
      body: { status },
    });
  },

  async updateStatus(
    companyId: string,
    invitationId: string,
    status: InterviewStatus
  ): Promise<InterviewInvitation> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.interviewInvitations.findIndex(
        (i) => i.id === invitationId && i.companyId === companyId
      );
      if (idx === -1) throw new Error("Invitation not found");
      store.interviewInvitations[idx].status = status;
      return store.interviewInvitations[idx];
    }
    const { apiClient } = await import("./client");
    return apiClient<InterviewInvitation>(`/interviews/${invitationId}`, {
      method: "PATCH",
      body: { status },
    });
  },
};

function enrich(items: InterviewInvitation[]): InterviewWithDetails[] {
  const store = getStore();
  return items.map((inv) => {
    const companyProfile = store.companyProfiles.find((p) => p.userId === inv.companyId);
    const companyUser = store.users.find((u) => u.id === inv.companyId);
    const studentProfile = store.studentProfiles.find((p) => p.userId === inv.studentId);
    const studentUser = store.users.find((u) => u.id === inv.studentId);
    const job = inv.jobId ? store.jobPostings.find((j) => j.id === inv.jobId) : undefined;
    return {
      ...inv,
      company: companyProfile && companyUser ? { ...companyProfile, user: companyUser } : undefined,
      student: studentProfile && studentUser ? { ...studentProfile, user: studentUser } : undefined,
      job,
    };
  });
}
