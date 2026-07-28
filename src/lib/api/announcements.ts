import { isMockMode } from "@/lib/config/env";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type { AnnouncementAudience, SiteAnnouncement } from "@/types";

const USE_MOCK = isMockMode();

export type AnnouncementContext = "all" | "student" | "company";

function toAudience(value: string): AnnouncementAudience {
  if (value === "student" || value === "company") return value;
  return "all";
}

export const announcementsApi = {
  async listPublished(context: AnnouncementContext = "all"): Promise<SiteAnnouncement[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore()
        .siteAnnouncements.filter((item) => {
          if (!item.published) return false;
          if (context === "student") {
            return item.audience === "all" || item.audience === "student";
          }
          if (context === "company") {
            return item.audience === "all" || item.audience === "company";
          }
          return item.audience === "all";
        })
        .sort((a, b) => b.priority - a.priority || b.createdAt.localeCompare(a.createdAt));
    }
    const { apiClient } = await import("./client");
    return apiClient<SiteAnnouncement[]>(
      `platform/announcements?context=${encodeURIComponent(context)}`
    );
  },

  async listAll(): Promise<SiteAnnouncement[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().siteAnnouncements.sort(
        (a, b) => b.priority - a.priority || b.createdAt.localeCompare(a.createdAt)
      );
    }
    const { apiClient } = await import("./client");
    return apiClient<SiteAnnouncement[]>("admin/announcements");
  },

  async create(data: {
    message: string;
    linkUrl?: string;
    audience?: AnnouncementAudience;
    published?: boolean;
    priority?: number;
  }): Promise<SiteAnnouncement> {
    if (USE_MOCK) {
      await simulateDelay();
      const now = new Date().toISOString();
      const item: SiteAnnouncement = {
        id: generateId("ann"),
        message: data.message,
        linkUrl: data.linkUrl,
        audience: data.audience ?? "all",
        published: data.published ?? false,
        priority: data.priority ?? 0,
        createdAt: now,
        updatedAt: now,
      };
      getStore().siteAnnouncements.unshift(item);
      return item;
    }
    const { apiClient } = await import("./client");
    return apiClient<SiteAnnouncement>("admin/announcements", {
      method: "POST",
      body: data,
    });
  },

  async update(
    id: string,
    data: Partial<{
      message: string;
      linkUrl: string | null;
      audience: AnnouncementAudience;
      published: boolean;
      priority: number;
    }>
  ): Promise<SiteAnnouncement> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.siteAnnouncements.findIndex((item) => item.id === id);
      if (idx === -1) throw new Error("Announcement not found");
      store.siteAnnouncements[idx] = {
        ...store.siteAnnouncements[idx],
        ...data,
        linkUrl: data.linkUrl === null ? undefined : data.linkUrl ?? store.siteAnnouncements[idx].linkUrl,
        updatedAt: new Date().toISOString(),
      };
      return store.siteAnnouncements[idx];
    }
    const { apiClient } = await import("./client");
    return apiClient<SiteAnnouncement>(`admin/announcements/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  async remove(id: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      store.siteAnnouncements = store.siteAnnouncements.filter((item) => item.id !== id);
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`admin/announcements/${id}`, { method: "DELETE" });
  },
};

export { toAudience };
