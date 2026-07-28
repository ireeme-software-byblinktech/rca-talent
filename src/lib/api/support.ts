import { isMockMode } from "@/lib/config/env";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketStatus,
  SupportTicketSubmitter,
  UserRole,
} from "@/types";

const USE_MOCK = isMockMode();

export interface CreateSupportTicketData {
  category: SupportTicketCategory;
  subject: string;
  message: string;
  email: string;
}

export interface UpdateSupportTicketData {
  status?: SupportTicketStatus;
  adminNote?: string;
}

export interface SupportTicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  dismissed: number;
  total: number;
}

const CATEGORY_FROM_API: Record<string, SupportTicketCategory> = {
  BUG: "bug",
  IMPROVEMENT: "improvement",
  QUESTION: "question",
  OTHER: "other",
  bug: "bug",
  improvement: "improvement",
  question: "question",
  other: "other",
};

const CATEGORY_TO_API: Record<SupportTicketCategory, string> = {
  bug: "BUG",
  improvement: "IMPROVEMENT",
  question: "QUESTION",
  other: "OTHER",
};

const STATUS_FROM_API: Record<string, SupportTicketStatus> = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
  open: "open",
  in_progress: "in_progress",
  resolved: "resolved",
  dismissed: "dismissed",
};

const STATUS_TO_API: Record<SupportTicketStatus, string> = {
  open: "OPEN",
  in_progress: "IN_PROGRESS",
  resolved: "RESOLVED",
  dismissed: "DISMISSED",
};

const ROLE_FROM_API: Record<string, UserRole> = {
  STUDENT: "student",
  COMPANY: "company",
  ADMIN: "admin",
  CONTENT_MANAGER: "content_manager",
  student: "student",
  company: "company",
  admin: "admin",
  content_manager: "content_manager",
};

function mapSubmitter(
  raw: Record<string, unknown> | undefined,
  fallbackEmail: string,
  fallbackUserId?: string
): SupportTicketSubmitter {
  if (!raw) {
    return {
      email: fallbackEmail,
      userId: fallbackUserId,
      isRegistered: Boolean(fallbackUserId),
    };
  }
  const roleRaw = raw.role ? String(raw.role) : undefined;
  return {
    email: String(raw.email ?? fallbackEmail),
    userId: (raw.userId as string | undefined) ?? fallbackUserId,
    role: roleRaw ? ROLE_FROM_API[roleRaw] : undefined,
    name: (raw.name as string | undefined) ?? undefined,
    isRegistered: Boolean(raw.isRegistered ?? raw.userId ?? fallbackUserId),
  };
}

function mapTicket(raw: Record<string, unknown>): SupportTicket {
  const email = String(raw.email ?? "");
  const userId = (raw.userId as string | undefined) ?? undefined;
  return {
    id: raw.id as string,
    category: CATEGORY_FROM_API[String(raw.category)] ?? "other",
    subject: String(raw.subject ?? ""),
    message: String(raw.message ?? ""),
    email,
    userId,
    status: STATUS_FROM_API[String(raw.status)] ?? "open",
    adminNote: (raw.adminNote as string | undefined) ?? undefined,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
    submitter: mapSubmitter(
      raw.submitter as Record<string, unknown> | undefined,
      email,
      userId
    ),
  };
}

export const supportApi = {
  async create(data: CreateSupportTicketData): Promise<SupportTicket> {
    if (USE_MOCK) {
      await simulateDelay();
      const now = new Date().toISOString();
      const email = data.email.trim().toLowerCase();
      const ticket: SupportTicket = {
        id: generateId("support"),
        category: data.category,
        subject: data.subject.trim(),
        message: data.message.trim(),
        email,
        status: "open",
        createdAt: now,
        updatedAt: now,
        submitter: {
          email,
          isRegistered: false,
        },
      };
      getStore().supportTickets.unshift(ticket);
      return ticket;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>("support", {
      method: "POST",
      body: {
        category: CATEGORY_TO_API[data.category],
        subject: data.subject,
        message: data.message,
        email: data.email,
      },
      skipRefresh: true,
    });
    return mapTicket(raw);
  },

  async list(filters?: {
    status?: SupportTicketStatus;
    category?: SupportTicketCategory;
  }): Promise<SupportTicket[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return getStore()
        .supportTickets.filter((t) => {
          if (filters?.status && t.status !== filters.status) return false;
          if (filters?.category && t.category !== filters.category) return false;
          return true;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    const { apiClient } = await import("./client");
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", STATUS_TO_API[filters.status]);
    if (filters?.category)
      params.set("category", CATEGORY_TO_API[filters.category]);
    const qs = params.toString();
    const raw = await apiClient<Record<string, unknown>[]>(
      qs ? `admin/support?${qs}` : "admin/support"
    );
    return raw.map(mapTicket);
  },

  async update(
    id: string,
    data: UpdateSupportTicketData
  ): Promise<SupportTicket> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.supportTickets.findIndex((t) => t.id === id);
      if (idx < 0) throw new Error("Support ticket not found");
      const updated: SupportTicket = {
        ...store.supportTickets[idx],
        status: data.status ?? store.supportTickets[idx].status,
        adminNote:
          data.adminNote !== undefined
            ? data.adminNote
            : store.supportTickets[idx].adminNote,
        updatedAt: new Date().toISOString(),
      };
      store.supportTickets[idx] = updated;
      return updated;
    }
    const { apiClient } = await import("./client");
    const body: Record<string, string> = {};
    if (data.status) body.status = STATUS_TO_API[data.status];
    if (data.adminNote !== undefined) body.adminNote = data.adminNote;
    const raw = await apiClient<Record<string, unknown>>(`admin/support/${id}`, {
      method: "PATCH",
      body,
    });
    return mapTicket(raw);
  },

  async getStats(): Promise<SupportTicketStats> {
    if (USE_MOCK) {
      await simulateDelay();
      const tickets = getStore().supportTickets;
      return {
        open: tickets.filter((t) => t.status === "open").length,
        inProgress: tickets.filter((t) => t.status === "in_progress").length,
        resolved: tickets.filter((t) => t.status === "resolved").length,
        dismissed: tickets.filter((t) => t.status === "dismissed").length,
        total: tickets.length,
      };
    }
    const { apiClient } = await import("./client");
    return apiClient<SupportTicketStats>("admin/support/stats");
  },
};
