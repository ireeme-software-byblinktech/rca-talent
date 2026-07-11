import { isMockMode } from "@/lib/config/env";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import type { ContactRequest, ContactRequestWithDetails } from "@/types";
import type { BackendContactRequest } from "./mappers";
import {
  mapContactRequest,
  mapContactRequestWithDetails,
} from "./mappers";

const USE_MOCK = isMockMode();

export interface CreateContactRequestData {
  studentId: string;
  message: string;
}

export interface AcceptedCandidate {
  requestId: string;
  userId: string;
  fullName: string;
  cohortYear: number;
}

function enrichRequest(
  request: ContactRequest,
  store: ReturnType<typeof getStore>
): ContactRequestWithDetails {
  const companyProfile = store.companyProfiles.find(
    (p) => p.userId === request.companyId
  );
  const companyUser = store.users.find((u) => u.id === request.companyId);
  const studentProfile = store.studentProfiles.find(
    (p) => p.userId === request.studentId
  );
  const studentUser = store.users.find((u) => u.id === request.studentId);

  return {
    ...request,
    company: companyProfile && companyUser
      ? { ...companyProfile, user: companyUser }
      : undefined,
    student: studentProfile && studentUser
      ? { ...studentProfile, user: studentUser }
      : undefined,
  };
}

export const contactRequestsApi = {
  async getForStudent(studentId: string): Promise<ContactRequestWithDetails[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      return store.contactRequests
        .filter((r) => r.studentId === studentId)
        .map((r) => enrichRequest(r, store))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<BackendContactRequest[]>(
      "/contact-requests/received/me"
    );
    return raw.map((r) => mapContactRequestWithDetails(r));
  },

  async getAcceptedCandidates(_companyId: string): Promise<AcceptedCandidate[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      return store.contactRequests
        .filter((r) => r.companyId === _companyId && r.status === "accepted")
        .map((r) => {
          const profile = store.studentProfiles.find(
            (p) => p.userId === r.studentId
          );
          return {
            requestId: r.id,
            userId: r.studentId,
            fullName: profile?.fullName ?? "Student",
            cohortYear: profile?.cohortYear ?? new Date().getFullYear(),
          };
        });
    }
    const { apiClient } = await import("./client");
    return apiClient<AcceptedCandidate[]>("/contact-requests/candidates");
  },

  async getForCompany(companyId: string): Promise<ContactRequestWithDetails[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      return store.contactRequests
        .filter((r) => r.companyId === companyId)
        .map((r) => enrichRequest(r, store))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<BackendContactRequest[]>(
      "/contact-requests/sent/me"
    );
    return raw.map((r) => mapContactRequestWithDetails(r));
  },

  async create(
    _companyId: string,
    data: CreateContactRequestData
  ): Promise<ContactRequest> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const companyId = _companyId;
      const existing = store.contactRequests.find(
        (r) =>
          r.companyId === companyId &&
          r.studentId === data.studentId &&
          (r.status === "pending" || r.status === "accepted")
      );
      if (existing) {
        throw new Error("A contact request already exists for this student");
      }
      const request: ContactRequest = {
        id: generateId("cr"),
        companyId,
        studentId: data.studentId,
        status: "pending",
        message: data.message,
        createdAt: new Date().toISOString(),
      };
      store.contactRequests.push(request);
      store.notifications.push({
        id: generateId("notif"),
        userId: data.studentId,
        title: "New contact request",
        message: `${store.companyProfiles.find((p) => p.userId === companyId)?.companyName ?? "A company"} sent you a contact request.`,
        read: false,
        createdAt: new Date().toISOString(),
        type: "contact_request",
      });
      return request;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<BackendContactRequest>("/contact-requests", {
      method: "POST",
      body: { receiverId: data.studentId, message: data.message },
    });
    return mapContactRequest(raw);
  },

  async respond(
    requestId: string,
    _studentId: string,
    status: "accepted" | "declined"
  ): Promise<ContactRequest> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.contactRequests.findIndex(
        (r) => r.id === requestId && r.studentId === _studentId
      );
      if (idx === -1) throw new Error("Request not found");
      store.contactRequests[idx].status = status;
      store.contactRequests[idx].respondedAt = new Date().toISOString();
      return store.contactRequests[idx];
    }
    const { apiClient } = await import("./client");
    const endpoint =
      status === "accepted"
        ? `/contact-requests/${requestId}/accept`
        : `/contact-requests/${requestId}/decline`;
    const raw = await apiClient<BackendContactRequest>(endpoint, {
      method: "POST",
    });
    return mapContactRequest(raw);
  },

  async getExistingRequest(
    companyId: string,
    studentId: string
  ): Promise<ContactRequest | null> {
    if (USE_MOCK) {
      await simulateDelay(100);
      const store = getStore();
      return (
        store.contactRequests.find(
          (r) =>
            r.companyId === companyId &&
            r.studentId === studentId &&
            (r.status === "pending" || r.status === "accepted")
        ) ?? null
      );
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<BackendContactRequest | null>(
      `/contact-requests/existing?companyId=${companyId}&studentId=${studentId}`
    );
    return raw ? mapContactRequest(raw) : null;
  },
};
