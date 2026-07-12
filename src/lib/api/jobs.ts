import { isMockMode } from "@/lib/config/env";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import {
  mapJobApplication,
  mapJobPosting,
  mapJobToBackend,
} from "@/lib/api/mappers";
import type { JobApplication, JobPosting, JobType } from "@/types";

const USE_MOCK = isMockMode();

export interface CreateJobData {
  title: string;
  description: string;
  type: JobType;
  location: string;
  skills: string[];
}

export const jobsApi = {
  async getForCompany(companyId: string): Promise<JobPosting[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().jobPostings.filter((j) => j.companyId === companyId);
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>(
      `/companies/${companyId}/jobs`
    );
    return raw.map((job) => mapJobPosting(job, companyId));
  },

  async getOpen(): Promise<JobPosting[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().jobPostings.filter((j) => j.status === "open");
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>("/jobs/open");
    return raw.map((job) => mapJobPosting(job));
  },

  async apply(jobId: string, coverLetter?: string): Promise<JobApplication> {
    if (USE_MOCK) {
      await simulateDelay();
      const job = getStore().jobPostings.find((j) => j.id === jobId);
      return {
        id: generateId("app"),
        jobId,
        studentId: "mock-student",
        coverLetter,
        status: "applied",
        createdAt: new Date().toISOString(),
        job,
      };
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(`/jobs/${jobId}/apply`, {
      method: "POST",
      body: { coverLetter },
    });
    return mapJobApplication(raw);
  },

  async getMyApplications(): Promise<JobApplication[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return [];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>(
      "/jobs/my-applications"
    );
    return raw.map(mapJobApplication);
  },

  async getApplicationsForCompany(companyId: string): Promise<JobApplication[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return [];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>(
      `/companies/${companyId}/jobs/applications`
    );
    return raw.map(mapJobApplication);
  },

  async getApplicationsForJob(
    companyId: string,
    jobId: string
  ): Promise<JobApplication[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return [];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>(
      `/companies/${companyId}/jobs/${jobId}/applications`
    );
    return raw.map(mapJobApplication);
  },

  async updateApplicationStatus(
    companyId: string,
    jobId: string,
    applicationId: string,
    status: "under_review" | "accepted" | "rejected"
  ): Promise<JobApplication> {
    if (USE_MOCK) {
      await simulateDelay();
      return {
        id: applicationId,
        jobId,
        studentId: "",
        status,
        createdAt: new Date().toISOString(),
      };
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/companies/${companyId}/jobs/${jobId}/applications/${applicationId}`,
      {
        method: "PATCH",
        body: { status },
      }
    );
    return mapJobApplication(raw);
  },

  async create(companyId: string, data: CreateJobData): Promise<JobPosting> {
    if (USE_MOCK) {
      await simulateDelay();
      const job: JobPosting = {
        id: generateId("job"),
        companyId,
        ...data,
        status: "open",
        createdAt: new Date().toISOString(),
      };
      getStore().jobPostings.push(job);
      return job;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/companies/${companyId}/jobs`,
      {
        method: "POST",
        body: mapJobToBackend(data),
      }
    );
    return mapJobPosting({ ...raw, type: data.type, skills: data.skills }, companyId);
  },

  async update(
    companyId: string,
    jobId: string,
    data: Partial<CreateJobData>
  ): Promise<JobPosting> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.jobPostings.findIndex(
        (j) => j.id === jobId && j.companyId === companyId
      );
      if (idx === -1) throw new Error("Job not found");
      store.jobPostings[idx] = { ...store.jobPostings[idx], ...data };
      return store.jobPostings[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/companies/${companyId}/jobs/${jobId}`,
      {
        method: "PATCH",
        body: mapJobToBackend(data),
      }
    );
    return mapJobPosting({ ...raw, type: data.type, skills: data.skills }, companyId);
  },

  async updateStatus(
    companyId: string,
    jobId: string,
    status: "open" | "closed"
  ): Promise<JobPosting> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.jobPostings.findIndex(
        (j) => j.id === jobId && j.companyId === companyId
      );
      if (idx === -1) throw new Error("Job not found");
      store.jobPostings[idx].status = status;
      return store.jobPostings[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/companies/${companyId}/jobs/${jobId}`,
      {
        method: "PATCH",
        body: mapJobToBackend({ status }),
      }
    );
    return mapJobPosting(raw, companyId);
  },

  async delete(companyId: string, jobId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      store.jobPostings = store.jobPostings.filter(
        (j) => !(j.id === jobId && j.companyId === companyId)
      );
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/companies/${companyId}/jobs/${jobId}`, {
      method: "DELETE",
    });
  },
};
