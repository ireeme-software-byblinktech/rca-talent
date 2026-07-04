import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type { BlogPost, BlogSubscriber } from "@/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export interface CreateBlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  published?: boolean;
  coverImage?: string;
}

export const blogApi = {
  async listPublished(): Promise<BlogPost[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore()
        .blogPosts.filter((p) => p.published)
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
    }
    const { apiClient } = await import("./client");
    return apiClient<BlogPost[]>("/blog");
  },

  async listAll(): Promise<BlogPost[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().blogPosts.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
    const { apiClient } = await import("./client");
    return apiClient<BlogPost[]>("/admin/blog");
  },

  async getBySlug(slug: string): Promise<BlogPost | null> {
    if (USE_MOCK) {
      await simulateDelay();
      const post = getStore().blogPosts.find((p) => p.slug === slug);
      return post?.published ? post : null;
    }
    const { apiClient } = await import("./client");
    return apiClient<BlogPost | null>(`/blog/${slug}`);
  },

  async getBySlugAdmin(slug: string): Promise<BlogPost | null> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().blogPosts.find((p) => p.slug === slug) ?? null;
    }
    const { apiClient } = await import("./client");
    return apiClient<BlogPost | null>(`/admin/blog/${slug}`);
  },

  async create(data: CreateBlogPostData): Promise<BlogPost> {
    if (USE_MOCK) {
      await simulateDelay();
      const now = new Date().toISOString();
      const post: BlogPost = {
        id: generateId("blog"),
        ...data,
        published: data.published ?? false,
        publishedAt: now,
        updatedAt: now,
      };
      getStore().blogPosts.unshift(post);
      return post;
    }
    const { apiClient } = await import("./client");
    return apiClient<BlogPost>("/admin/blog", { method: "POST", body: data });
  },

  async update(id: string, data: Partial<CreateBlogPostData>): Promise<BlogPost> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.blogPosts.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Post not found");
      store.blogPosts[idx] = {
        ...store.blogPosts[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return store.blogPosts[idx];
    }
    const { apiClient } = await import("./client");
    return apiClient<BlogPost>(`/admin/blog/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      store.blogPosts = store.blogPosts.filter((p) => p.id !== id);
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>(`/admin/blog/${id}`, { method: "DELETE" });
  },

  async subscribe(email: string, userId?: string): Promise<BlogSubscriber> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const existing = store.blogSubscribers.find(
        (s) => s.email.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        existing.active = true;
        if (userId) existing.userId = userId;
        return existing;
      }
      const sub: BlogSubscriber = {
        id: generateId("sub"),
        email: email.toLowerCase(),
        userId,
        active: true,
        subscribedAt: new Date().toISOString(),
      };
      store.blogSubscribers.push(sub);
      return sub;
    }
    const { apiClient } = await import("./client");
    return apiClient<BlogSubscriber>("/blog/subscribe", {
      method: "POST",
      body: { email, userId },
    });
  },

  async unsubscribe(email: string): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const sub = store.blogSubscribers.find(
        (s) => s.email.toLowerCase() === email.toLowerCase()
      );
      if (sub) sub.active = false;
      return;
    }
    const { apiClient } = await import("./client");
    return apiClient<void>("/blog/unsubscribe", {
      method: "POST",
      body: { email },
    });
  },

  async isSubscribed(email: string): Promise<boolean> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().blogSubscribers.some(
        (s) => s.email.toLowerCase() === email.toLowerCase() && s.active
      );
    }
    const { apiClient } = await import("./client");
    return apiClient<boolean>(`/blog/subscribe/status?email=${encodeURIComponent(email)}`);
  },

  async getSubscriberCount(): Promise<number> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore().blogSubscribers.filter((s) => s.active).length;
    }
    const { apiClient } = await import("./client");
    return apiClient<number>("/admin/blog/subscribers/count");
  },
};
