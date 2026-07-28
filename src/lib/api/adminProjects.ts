import { isMockMode } from "@/lib/config/env";
import { getStore, simulateDelay } from "@/lib/mock/store";
import { mapProject } from "./mappers";
import type { Project } from "@/types";

const USE_MOCK = isMockMode();

export interface PendingProjectWithStudent extends Project {
  student?: {
    id: string;
    fullName: string;
    userId: string;
    email: string;
  };
}

function mapPendingProject(raw: Record<string, unknown>): PendingProjectWithStudent {
  const project = mapProject(raw, String(raw.studentProfileId ?? ""));
  const sp = raw.studentProfile as Record<string, unknown> | undefined;
  const user = sp?.user as Record<string, unknown> | undefined;

  return {
    ...project,
    student: sp
      ? {
          id: String(sp.id ?? ""),
          fullName:
            ((sp.fullName as string) ??
            `${sp.firstName ?? ""} ${sp.lastName ?? ""}`.trim()) ||
            "Student",
          userId: String(sp.userId ?? ""),
          email: String(user?.email ?? ""),
        }
      : undefined,
  };
}

export const adminProjectsApi = {
  /** Get all projects pending admin review. */
  async getPendingProjects(): Promise<PendingProjectWithStudent[]> {
    if (USE_MOCK) {
      await simulateDelay(150);
      const store = getStore();
      return store.projects
        .filter((p) => p.publishStatus === "pending_review")
        .map((p) => ({ ...p, student: undefined }));
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>("/admin/projects/pending");
    return raw.map(mapPendingProject);
  },

  /** Approve a project for public display. */
  async approveProject(projectId: string): Promise<Project> {
    if (USE_MOCK) {
      await simulateDelay(150);
      const store = getStore();
      const idx = store.projects.findIndex((p) => p.id === projectId);
      if (idx === -1) throw new Error("Project not found");
      store.projects[idx].publishStatus = "approved";
      return store.projects[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/admin/projects/${projectId}/approve`,
      { method: "PATCH" },
    );
    return mapProject(raw, String(raw.studentProfileId ?? ""));
  },

  /** Reject a project submission with an optional reason. */
  async rejectProject(projectId: string, reason?: string): Promise<Project> {
    if (USE_MOCK) {
      await simulateDelay(150);
      const store = getStore();
      const idx = store.projects.findIndex((p) => p.id === projectId);
      if (idx === -1) throw new Error("Project not found");
      store.projects[idx].publishStatus = "rejected";
      store.projects[idx].rejectionReason = reason;
      return store.projects[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/admin/projects/${projectId}/reject`,
      { method: "PATCH", body: { reason } },
    );
    return mapProject(raw, String(raw.studentProfileId ?? ""));
  },
};
