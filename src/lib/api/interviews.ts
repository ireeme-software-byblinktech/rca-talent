import { isMockMode } from "@/lib/config/env";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type { InterviewInvitation, InterviewStatus, JobPosting } from "@/types";
import type { CompanyProfile, StudentProfile, User } from "@/types";
import { mapInterview, mapUser, type BackendUser } from "./mappers";

const USE_MOCK = isMockMode();

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
    const raw = await apiClient<Record<string, unknown>[]>(
      `/companies/${companyId}/interviews`
    );
    return raw.map((item) => enrichFromBackend(item));
  },

  async getForStudent(studentId: string): Promise<InterviewWithDetails[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return enrich(getStore().interviewInvitations.filter((i) => i.studentId === studentId));
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>(
      `/students/${studentId}/interviews`
    );
    return raw.map((item) => enrichFromBackend(item));
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
    const raw = await apiClient<Record<string, unknown>>("/interviews", {
      method: "POST",
      body: { ...data, companyId },
    });
    return mapInterview(raw);
  },

  async respond(
    invitationId: string,
    _studentId: string,
    status: "accepted" | "declined"
  ): Promise<InterviewInvitation> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.interviewInvitations.findIndex(
        (i) => i.id === invitationId && i.studentId === _studentId
      );
      if (idx === -1) throw new Error("Invitation not found");
      store.interviewInvitations[idx].status = status;
      return store.interviewInvitations[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/interviews/${invitationId}/respond`,
      { method: "POST", body: { status } }
    );
    return mapInterview(raw);
  },

  async updateStatus(
    _companyId: string,
    invitationId: string,
    status: InterviewStatus
  ): Promise<InterviewInvitation> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.interviewInvitations.findIndex(
        (i) => i.id === invitationId
      );
      if (idx === -1) throw new Error("Invitation not found");
      store.interviewInvitations[idx].status = status;
      return store.interviewInvitations[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/interviews/${invitationId}`,
      {
        method: "PATCH",
        body: { status: status.toUpperCase() },
      }
    );
    return mapInterview(raw);
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

function enrichFromBackend(raw: Record<string, unknown>): InterviewWithDetails {
  const inv = mapInterview(raw);
  const result: InterviewWithDetails = { ...inv };

  const companyProfile = raw.companyProfile as Record<string, unknown> | undefined;
  const studentProfile = raw.studentProfile as Record<string, unknown> | undefined;
  const project = raw.project as Record<string, unknown> | undefined;

  if (companyProfile?.user) {
    result.company = {
      userId: companyProfile.userId as string,
      companyName: (companyProfile.companyName as string) ?? "",
      description: (companyProfile.description as string) ?? "",
      industry: (companyProfile.industry as string) ?? "",
      verificationStatus: "approved",
      updatedAt: String(companyProfile.updatedAt ?? new Date().toISOString()),
      user: mapUser(companyProfile.user as unknown as BackendUser),
    };
  }

  if (studentProfile?.user) {
    const first = (studentProfile.firstName as string) ?? "";
    const last = (studentProfile.lastName as string) ?? "";
    result.student = {
      userId: studentProfile.userId as string,
      fullName: [first, last].filter(Boolean).join(" ") || "Student",
      bio: (studentProfile.bio as string) ?? "",
      skills: [],
      links: {},
      verificationStatus: "approved",
      cohortYear: (studentProfile.cohortYear as number) ?? new Date().getFullYear(),
      availability: [],
      isVisible: true,
      updatedAt: String(studentProfile.updatedAt ?? new Date().toISOString()),
      user: mapUser(studentProfile.user as unknown as BackendUser),
    };
  }

  if (project) {
    result.job = {
      id: project.id as string,
      companyId: inv.companyId,
      title: (project.title as string) ?? "",
      description: (project.description as string) ?? "",
      type: "full-time",
      location: (project.location as string) ?? "",
      skills: [],
      status: "open",
      createdAt: String(project.createdAt ?? new Date().toISOString()),
    };
  }

  return result;
}
