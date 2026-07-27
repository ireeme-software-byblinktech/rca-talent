import { isMockMode } from "@/lib/config/env";
import { generateId, getStore, simulateDelay } from "@/lib/mock/store";
import {
  mapContract,
  mapContractToBackend,
  mapContractWithDetails,
} from "@/lib/api/mappers";
import type {
  Contract,
  ContractSignature,
  ContractStatus,
  ContractWithDetails,
} from "@/types";

const USE_MOCK = isMockMode();

export interface CreateContractData {
  studentId: string;
  jobId?: string;
  interviewId?: string;
  title: string;
  role: string;
  startDate: string;
  compensation: string;
  terms: string;
}

export interface SignContractData {
  signerName: string;
  signatureData: string;
  method: "drawn" | "typed";
}

function enrich(items: Contract[]): ContractWithDetails[] {
  const store = getStore();
  return items.map((c) => {
    const companyProfile = store.companyProfiles.find((p) => p.userId === c.companyId);
    const companyUser = store.users.find((u) => u.id === c.companyId);
    const studentProfile = store.studentProfiles.find((p) => p.userId === c.studentId);
    const studentUser = store.users.find((u) => u.id === c.studentId);
    const job = c.jobId ? store.jobPostings.find((j) => j.id === c.jobId) : undefined;
    return {
      ...c,
      company: companyProfile && companyUser ? { ...companyProfile, user: companyUser } : undefined,
      student: studentProfile && studentUser ? { ...studentProfile, user: studentUser } : undefined,
      job,
    };
  });
}

function pushNotification(userId: string, title: string, message: string) {
  getStore().notifications.unshift({
    id: generateId("notif"),
    userId,
    title,
    message,
    read: false,
    type: "contract",
    createdAt: new Date().toISOString(),
  });
}

export const contractsApi = {
  async getForCompany(companyId: string): Promise<ContractWithDetails[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return enrich(getStore().contracts.filter((c) => c.companyId === companyId));
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>(
      `/contracts/company/${companyId}`
    );
    return raw.map((item) => mapContractWithDetails(item, { companyId }));
  },

  async getForStudent(studentId: string): Promise<ContractWithDetails[]> {
    if (USE_MOCK) {
      await simulateDelay();
      return enrich(getStore().contracts.filter((c) => c.studentId === studentId));
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>[]>(
      `/contracts/student/${studentId}`
    );
    return raw.map((item) => mapContractWithDetails(item, { studentId }));
  },

  async getById(contractId: string): Promise<ContractWithDetails | null> {
    if (USE_MOCK) {
      await simulateDelay();
      const contract = getStore().contracts.find((c) => c.id === contractId);
      return contract ? enrich([contract])[0] : null;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(`/contracts/${contractId}`);
    return mapContractWithDetails(raw);
  },

  async create(companyId: string, data: CreateContractData): Promise<Contract> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const accepted = store.contactRequests.some(
        (r) =>
          r.companyId === companyId &&
          r.studentId === data.studentId &&
          r.status === "accepted"
      );
      if (!accepted) {
        throw new Error("You can only send contracts to students who accepted your contact request.");
      }
      const now = new Date().toISOString();
      const contract: Contract = {
        id: generateId("contract"),
        companyId,
        ...data,
        status: "draft",
        createdAt: now,
        updatedAt: now,
      };
      store.contracts.push(contract);
      return contract;
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>("contracts", {
      method: "POST",
      body: mapContractToBackend({ ...data, companyId }),
    });
    return mapContract(raw, { companyId });
  },

  async signAndSend(
    companyId: string,
    contractId: string,
    signature: SignContractData
  ): Promise<Contract> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.contracts.findIndex(
        (c) => c.id === contractId && c.companyId === companyId
      );
      if (idx === -1) throw new Error("Contract not found");
      const contract = store.contracts[idx];
      if (!["draft", "pending_company"].includes(contract.status)) {
        throw new Error("This contract cannot be signed by the company right now.");
      }
      const sig: ContractSignature = {
        userId: companyId,
        signerName: signature.signerName,
        signedAt: new Date().toISOString(),
        signatureData: signature.signatureData,
        method: signature.method,
      };
      store.contracts[idx] = {
        ...contract,
        companySignature: sig,
        status: "pending_student",
        updatedAt: sig.signedAt,
      };
      pushNotification(
        contract.studentId,
        "Contract ready to sign",
        `${signature.signerName} sent you an employment contract for review.`
      );
      return store.contracts[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/contracts/${contractId}/sign-and-send`,
      { method: "POST", body: signature }
    );
    return mapContract(raw, { companyId });
  },

  async signAsStudent(
    studentId: string,
    contractId: string,
    signature: SignContractData
  ): Promise<Contract> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.contracts.findIndex(
        (c) => c.id === contractId && c.studentId === studentId
      );
      if (idx === -1) throw new Error("Contract not found");
      const contract = store.contracts[idx];
      if (contract.status !== "pending_student") {
        throw new Error("This contract is not awaiting your signature.");
      }
      const sig: ContractSignature = {
        userId: studentId,
        signerName: signature.signerName,
        signedAt: new Date().toISOString(),
        signatureData: signature.signatureData,
        method: signature.method,
      };
      store.contracts[idx] = {
        ...contract,
        studentSignature: sig,
        status: "signed",
        updatedAt: sig.signedAt,
      };
      pushNotification(
        contract.companyId,
        "Contract signed",
        `${signature.signerName} signed the contract "${contract.title}".`
      );
      return store.contracts[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/contracts/${contractId}/sign`,
      { method: "POST", body: signature }
    );
    return mapContract(raw, { studentId });
  },

  async decline(studentId: string, contractId: string): Promise<Contract> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.contracts.findIndex(
        (c) => c.id === contractId && c.studentId === studentId
      );
      if (idx === -1) throw new Error("Contract not found");
      store.contracts[idx].status = "declined";
      store.contracts[idx].updatedAt = new Date().toISOString();
      pushNotification(
        store.contracts[idx].companyId,
        "Contract declined",
        "The student declined the employment contract."
      );
      return store.contracts[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/contracts/${contractId}/decline`,
      { method: "POST" }
    );
    return mapContract(raw, { studentId });
  },

  async voidContract(companyId: string, contractId: string): Promise<Contract> {
    if (USE_MOCK) {
      await simulateDelay();
      const store = getStore();
      const idx = store.contracts.findIndex(
        (c) => c.id === contractId && c.companyId === companyId
      );
      if (idx === -1) throw new Error("Contract not found");
      if (store.contracts[idx].status === "signed") {
        throw new Error("Signed contracts cannot be voided.");
      }
      store.contracts[idx].status = "void";
      store.contracts[idx].updatedAt = new Date().toISOString();
      return store.contracts[idx];
    }
    const { apiClient } = await import("./client");
    const raw = await apiClient<Record<string, unknown>>(
      `/contracts/${contractId}/void`,
      { method: "POST" }
    );
    return mapContract(raw, { companyId });
  },
};

export type { ContractStatus };
