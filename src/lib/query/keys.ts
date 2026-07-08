/**
 * Centralized React Query key factory.
 * Use these keys for consistent cache invalidation across the app.
 */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },

  students: {
    all: ["students"] as const,
    profile: (userId: string) => ["students", userId, "profile"] as const,
    projects: (userId: string) => ["students", userId, "projects"] as const,
    certifications: (userId: string) =>
      ["students", userId, "certifications"] as const,
    achievements: (userId: string) =>
      ["students", userId, "achievements"] as const,
    search: (params: Record<string, unknown>) =>
      ["students", "search", params] as const,
    portfolio: (userId: string) => ["students", userId, "portfolio"] as const,
    analytics: (userId: string) => ["students", userId, "analytics"] as const,
  },

  companies: {
    profile: (userId: string) => ["companies", userId, "profile"] as const,
  },

  contactRequests: {
    forStudent: (studentId: string) =>
      ["contact-requests", "student", studentId] as const,
    forCompany: (companyId: string) =>
      ["contact-requests", "company", companyId] as const,
    existing: (companyId: string, studentId: string) =>
      ["contact-requests", "existing", companyId, studentId] as const,
  },

  interviews: {
    forCompany: (companyId: string) =>
      ["interviews", "company", companyId] as const,
    forStudent: (studentId: string) =>
      ["interviews", "student", studentId] as const,
  },

  messages: {
    conversations: (userId: string) =>
      ["messages", "conversations", userId] as const,
    thread: (conversationId: string) =>
      ["messages", "thread", conversationId] as const,
  },

  jobs: {
    forCompany: (companyId: string) => ["jobs", companyId] as const,
  },

  contracts: {
    forCompany: (companyId: string) => ["contracts", "company", companyId] as const,
    forStudent: (studentId: string) => ["contracts", "student", studentId] as const,
  },

  bookmarks: {
    forCompany: (companyId: string) => ["bookmarks", companyId] as const,
    check: (companyId: string, studentId: string) =>
      ["bookmarks", companyId, studentId] as const,
  },

  notifications: {
    forUser: (userId: string) => ["notifications", userId] as const,
  },

  admin: {
    metrics: ["admin", "metrics"] as const,
    analytics: ["admin", "analytics"] as const,
    pendingStudents: ["admin", "students", "pending"] as const,
    pendingCompanies: ["admin", "companies", "pending"] as const,
    allStudents: ["admin", "students"] as const,
    allCompanies: ["admin", "companies"] as const,
    users: (params: Record<string, unknown>) =>
      ["admin-users", params] as const,
    auditLogs: (params: Record<string, unknown>) =>
      ["admin-audit-logs", params] as const,
    reports: ["admin", "reports", "platform"] as const,
    moderation: ["admin", "moderation"] as const,
    blog: {
      posts: ["admin", "blog", "posts"] as const,
      subscribers: ["admin", "blog", "subscribers"] as const,
    },
  },

  blog: {
    posts: ["blog", "posts"] as const,
    post: (slug: string) => ["blog", "post", slug] as const,
    subscription: (userId: string) => ["blog", "subscription", userId] as const,
  },

  platform: {
    stats: ["platform", "stats"] as const,
  },

  portfolio: {
    public: (slug: string) => ["portfolio", slug] as const,
  },
} as const;
