import { simulateDelay } from "@/lib/mock/store";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

function getBookmarkKey(companyId: string) {
  return `rca-bookmarks-${companyId}`;
}

export const bookmarksApi = {
  async getAll(companyId: string): Promise<string[]> {
    if (USE_MOCK) {
      await simulateDelay(100);
      if (typeof window === "undefined") return [];
      try {
        const raw = localStorage.getItem(getBookmarkKey(companyId));
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
    const { apiClient } = await import("./client");
    return apiClient<string[]>(`/companies/${companyId}/bookmarks`);
  },

  async toggle(companyId: string, studentId: string): Promise<boolean> {
    if (USE_MOCK) {
      await simulateDelay(100);
      const key = getBookmarkKey(companyId);
      const current: string[] = JSON.parse(
        localStorage.getItem(key) ?? "[]"
      );
      const exists = current.includes(studentId);
      const next = exists
        ? current.filter((id) => id !== studentId)
        : [...current, studentId];
      localStorage.setItem(key, JSON.stringify(next));
      return !exists;
    }
    const { apiClient } = await import("./client");
    return apiClient<boolean>(
      `/companies/${companyId}/bookmarks/${studentId}`,
      { method: "POST" }
    );
  },

  async isBookmarked(companyId: string, studentId: string): Promise<boolean> {
    const all = await this.getAll(companyId);
    return all.includes(studentId);
  },
};
