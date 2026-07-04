import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type { JobPosting, JobType } from "@/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

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
    return apiClient<JobPosting[]>(`/companies/${companyId}/jobs`);
  },

  async getOpen(): Promise<JobPosting[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().jobPostings.filter((j) => j.status === "open");
    }
    const { apiClient } = await import("./client");
    return apiClient<JobPosting[]>("/jobs/open");
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
    return apiClient<JobPosting>(`/companies/${companyId}/jobs`, {
      method: "POST",
      body: data,
    });
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
    return apiClient<JobPosting>(`/companies/${companyId}/jobs/${jobId}`, {
      method: "PATCH",
      body: data,
    });
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
    return apiClient<JobPosting>(`/companies/${companyId}/jobs/${jobId}`, {
      method: "PATCH",
      body: { status },
    });
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
