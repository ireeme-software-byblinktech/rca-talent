import { paginate, type PaginatedResponse } from "@/lib/api/client";
import { isMockMode } from "@/lib/config/env";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type {
  Availability,
  Project,
  StudentProfile,
  StudentWithUser,
} from "@/types";
import {
  mapProject,
  mapProjectToBackend,
  mapStudentProfile,
  mapStudentUpdateToBackend,
  mapStudentWithUser,
} from "./mappers";
import { debugProfile } from "@/lib/debug/profile-debug";

const USE_MOCK = isMockMode();

export interface StudentSearchParams {
  query?: string;
  skills?: string[];
  cohortYear?: number;
  availability?: Availability;
  page?: number;
  pageSize?: number;
}

export interface UpdateStudentProfileData {
  fullName?: string;
  bio?: string;
  skills?: string[];
  links?: StudentProfile["links"];
  photoUrl?: string;
  cvUrl?: string;
  cohortYear?: number;
  availability?: Availability[];
  isVisible?: boolean;
}

export interface CreateProjectData {
  title: string;
  description: string;
  techStack: string[];
  links?: Project["links"];
  images?: string[];
}

export const studentsApi = {
  async getProfile(userId: string): Promise<StudentProfile | null> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      return store.studentProfiles.find((p) => p.userId === userId) ?? null;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(`/students/${userId}/profile`);
    const mapped = mapStudentProfile(raw);
    debugProfile("GET /students/:id/profile response", { raw, mapped });
    return mapped;
  },

  async updateProfile(
    userId: string,
    data: UpdateStudentProfileData
  ): Promise<StudentProfile> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.studentProfiles.findIndex((p) => p.userId === userId);
      if (idx === -1) throw new Error("Profile not found");
      store.studentProfiles[idx] = {
        ...store.studentProfiles[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return store.studentProfiles[idx];
    }
    const { apiClient } = await import("./client");
    const patchBody = mapStudentUpdateToBackend(data as Record<string, unknown>);
    debugProfile("PATCH /students/:id/profile request", { userId, input: data, patchBody });

    const patchResponse = await apiClient<Record<string, unknown>>(
      `/students/${userId}/profile`,
      {
        method: "PATCH",
        body: patchBody,
      }
    );
    debugProfile("PATCH /students/:id/profile response", patchResponse);

    if (data.skills !== undefined) {
      debugProfile("PUT /students/:id/skills/sync request", {
        userId,
        skillNames: data.skills,
      });
      try {
        await apiClient<Record<string, unknown>>(`/students/${userId}/skills/sync`, {
          method: "PUT",
          body: { skillNames: data.skills },
        });
      } catch (err) {
        console.error("[ProfileDebug] skills sync failed", err);
        throw new Error(
          err instanceof Error
            ? `Profile saved but skills failed: ${err.message}`
            : "Profile saved but skills failed to sync"
        );
      }
    }

    const raw = await apiClient<Record<string, unknown>>(
      `/students/${userId}/profile`
    );
    const mapped = mapStudentProfile(raw);
    debugProfile("GET /students/:id/profile after save", { raw, mapped });
    return mapped;
  },

  async resubmitForVerification(userId: string): Promise<StudentProfile> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.studentProfiles.findIndex((p) => p.userId === userId);
      if (idx === -1) throw new Error("Profile not found");
      store.studentProfiles[idx].verificationStatus = "pending";
      store.studentProfiles[idx].rejectionReason = undefined;
      store.studentProfiles[idx].updatedAt = new Date().toISOString();
      return store.studentProfiles[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/students/${userId}/resubmit-verification`,
      { method: "POST" }
    );
    return mapStudentProfile(raw);
  },

  async search(params: StudentSearchParams = {}): Promise<PaginatedResponse<StudentWithUser>> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const { query, skills, cohortYear, availability, page = 1, pageSize = 12 } = params;

      let results = store.studentProfiles
        .filter((p) => p.verificationStatus === "approved" && p.isVisible)
        .map((profile) => ({
          ...profile,
          user: store.users.find((u) => u.id === profile.userId)!,
        }));

      if (query) {
        const q = query.toLowerCase();
        results = results.filter(
          (s) =>
            s.fullName.toLowerCase().includes(q) ||
            s.bio.toLowerCase().includes(q) ||
            s.skills.some((sk) => sk.toLowerCase().includes(q))
        );
      }
      if (skills?.length) {
        results = results.filter((s) =>
          skills.some((sk) => s.skills.includes(sk))
        );
      }
      if (cohortYear) {
        results = results.filter((s) => s.cohortYear === cohortYear);
      }
      if (availability) {
        results = results.filter((s) => s.availability.includes(availability));
      }

      return paginate(results, page, pageSize);
    }
    const { apiClient } = await import("./client");
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value));
      }
    });
    return apiClient<PaginatedResponse<StudentWithUser>>(
      `/students/search?${searchParams}`
    );
  },

  async getStudentWithUser(userId: string): Promise<StudentWithUser | null> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const profile = store.studentProfiles.find((p) => p.userId === userId);
      if (!profile) return null;
      const user = store.users.find((u) => u.id === userId);
      if (!user) return null;
      return { ...profile, user };
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(`/students/${userId}`);
    return mapStudentWithUser(raw);
  },

  async getProjects(studentId: string): Promise<Project[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      return store.projects.filter((p) => p.studentId === studentId);
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>(
      `/students/${studentId}/projects`,
    );
    return raw.map((project) => mapProject(project, studentId));
  },

  async createProject(studentId: string, data: CreateProjectData): Promise<Project> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const project: Project = {
        id: generateId("proj"),
        studentId,
        ...data,
        links: data.links ?? {},
        images: data.images ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.projects.push(project);
      return project;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/students/${studentId}/projects`,
      {
        method: "POST",
        body: mapProjectToBackend(data),
      },
    );
    return mapProject(raw, studentId);
  },

  async updateProject(
    studentId: string,
    projectId: string,
    data: Partial<CreateProjectData>
  ): Promise<Project> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.projects.findIndex(
        (p) => p.id === projectId && p.studentId === studentId
      );
      if (idx === -1) throw new Error("Project not found");
      store.projects[idx] = {
        ...store.projects[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return store.projects[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/students/${studentId}/projects/${projectId}`,
      {
        method: "PATCH",
        body: mapProjectToBackend(data),
      },
    );
    return mapProject(raw, studentId);
  },

  async deleteProject(studentId: string, projectId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      store.projects = store.projects.filter(
        (p) => !(p.id === projectId && p.studentId === studentId)
      );
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/students/${studentId}/projects/${projectId}`, {
      method: "DELETE",
    });
  },

  getProfileCompleteness(profile: StudentProfile, projectCount: number): number {
    let score = 0;
    if (profile.fullName) score += 15;
    if (profile.bio && profile.bio.length > 20) score += 20;
    if (profile.skills.length >= 3) score += 20;
    if (profile.links.github || profile.links.linkedin || profile.links.portfolio) score += 15;
    if (profile.photoUrl) score += 10;
    if (profile.cvUrl) score += 10;
    if (projectCount >= 1) score += 10;
    return Math.min(score, 100);
  },
};
