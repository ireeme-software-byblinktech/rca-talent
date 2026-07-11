import {
  mapAchievement,
  mapAchievementToBackend,
  mapCertification,
} from "@/lib/api/mappers";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type { Achievement, Certification } from "@/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const certificationsApi = {
  async getForStudent(studentId: string): Promise<Certification[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().certifications.filter((c) => c.studentId === studentId);
    }
    const { apiClient } = await import("./client");
    const rows = await apiClient<Record<string, unknown>[]>(
      `/students/${studentId}/certifications`,
    );
    return rows.map((row) => mapCertification(row, studentId));
  },

  async create(
    studentId: string,
    data: Omit<Certification, "id" | "studentId">
  ): Promise<Certification> {
    if (USE_MOCK) {
      await simulateDelay();
      const cert: Certification = { id: generateId("cert"), studentId, ...data };
      getStore().certifications.push(cert);
      return cert;
    }
    const { apiClient } = await import("./client");
    const row = await apiClient<Record<string, unknown>>(
      `/students/${studentId}/certifications`,
      {
        method: "POST",
        body: data,
      },
    );
    return mapCertification(row, studentId);
  },

  async delete(studentId: string, certId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      store.certifications = store.certifications.filter(
        (c) => !(c.id === certId && c.studentId === studentId)
      );
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/students/${studentId}/certifications/${certId}`, {
      method: "DELETE",
    });
  },

  async update(
    studentId: string,
    certId: string,
    data: Partial<Omit<Certification, "id" | "studentId">>
  ): Promise<Certification> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.certifications.findIndex(
        (c) => c.id === certId && c.studentId === studentId
      );
      if (idx === -1) throw new Error("Certification not found");
      store.certifications[idx] = { ...store.certifications[idx], ...data };
      return store.certifications[idx];
    }
    const { apiClient } = await import("./client");
    const row = await apiClient<Record<string, unknown>>(
      `/students/${studentId}/certifications/${certId}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return mapCertification(row, studentId);
  },

  async getAchievements(studentId: string): Promise<Achievement[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().achievements.filter((a) => a.studentId === studentId);
    }
    const { apiClient } = await import("./client");
    const rows = await apiClient<Record<string, unknown>[]>(
      `/students/${studentId}/achievements`,
    );
    return rows.map((row) => mapAchievement(row, studentId));
  },

  async createAchievement(
    studentId: string,
    data: Omit<Achievement, "id" | "studentId">
  ): Promise<Achievement> {
    if (USE_MOCK) {
      await simulateDelay();
      const ach: Achievement = { id: generateId("ach"), studentId, ...data };
      getStore().achievements.push(ach);
      return ach;
    }
    const { apiClient } = await import("./client");
    const row = await apiClient<Record<string, unknown>>(
      `/students/${studentId}/achievements`,
      {
        method: "POST",
        body: mapAchievementToBackend(data),
      },
    );
    return mapAchievement(row, studentId);
  },

  async deleteAchievement(studentId: string, achId: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      store.achievements = store.achievements.filter(
        (a) => !(a.id === achId && a.studentId === studentId)
      );
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/students/${studentId}/achievements/${achId}`, {
      method: "DELETE",
    });
  },

  async updateAchievement(
    studentId: string,
    achId: string,
    data: Partial<Omit<Achievement, "id" | "studentId">>
  ): Promise<Achievement> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.achievements.findIndex(
        (a) => a.id === achId && a.studentId === studentId
      );
      if (idx === -1) throw new Error("Achievement not found");
      store.achievements[idx] = { ...store.achievements[idx], ...data };
      return store.achievements[idx];
    }
    const { apiClient } = await import("./client");
    const row = await apiClient<Record<string, unknown>>(
      `/students/${studentId}/achievements/${achId}`,
      {
        method: "PATCH",
        body: mapAchievementToBackend(data),
      },
    );
    return mapAchievement(row, studentId);
  },
};
