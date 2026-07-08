import type {
  AuthSession,
  CompanyProfile,
  CompanyWithUser,
  ContactRequest,
  ContactRequestStatus,
  ContactRequestWithDetails,
  InterviewInvitation,
  InterviewStatus,
  StudentProfile,
  StudentWithUser,
  User,
  UserRole,
  VerificationStatus,
} from "@/types";

// ─── Backend response shapes (partial) ───────────────────────────────────────

export interface BackendUser {
  id: string;
  email: string;
  role: string;
  status?: string;
  isEmailVerified?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}

export interface BackendContactRequest {
  id: string;
  sender: BackendUser & { companyName?: string };
  receiver: BackendUser & {
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
  message: string;
  status: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// ─── Enum mappers ────────────────────────────────────────────────────────────

const ROLE_MAP: Record<string, UserRole> = {
  STUDENT: "student",
  COMPANY: "company",
  ADMIN: "admin",
};

const VERIFICATION_MAP: Record<string, VerificationStatus> = {
  PENDING: "pending",
  VERIFIED: "approved",
  REJECTED: "rejected",
};

const CONTACT_STATUS_MAP: Record<string, ContactRequestStatus> = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "declined",
  CANCELLED: "declined",
};

const INTERVIEW_STATUS_MAP: Record<string, InterviewStatus> = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  COMPLETED: "completed",
};

export function mapRole(role: string): UserRole {
  return ROLE_MAP[role.toUpperCase()] ?? (role.toLowerCase() as UserRole);
}

export function mapRoleToBackend(role: UserRole): string {
  return role.toUpperCase();
}

export function mapVerificationStatus(status: string): VerificationStatus {
  return VERIFICATION_MAP[status.toUpperCase()] ?? "pending";
}

export function mapVerificationToBackend(
  status: VerificationStatus
): string {
  const map: Record<VerificationStatus, string> = {
    pending: "PENDING",
    approved: "VERIFIED",
    rejected: "REJECTED",
  };
  return map[status];
}

export function mapContactStatus(status: string): ContactRequestStatus {
  return CONTACT_STATUS_MAP[status.toUpperCase()] ?? "pending";
}

export function mapInterviewStatus(status: string): InterviewStatus {
  return INTERVIEW_STATUS_MAP[status.toUpperCase()] ?? "pending";
}

function toIso(value: string | Date | undefined): string {
  if (!value) return new Date().toISOString();
  return typeof value === "string" ? value : value.toISOString();
}

// ─── User mappers ────────────────────────────────────────────────────────────

export function mapUser(raw: BackendUser): User {
  const status = raw.status?.toUpperCase() ?? "ACTIVE";
  return {
    id: raw.id,
    email: raw.email,
    role: mapRole(raw.role),
    createdAt: toIso(raw.createdAt),
    isActive: status === "ACTIVE",
  };
}

export function mapAuthResponse(raw: BackendAuthResponse): AuthSession {
  return {
    user: mapUser(raw.user),
    token: raw.accessToken,
    refreshToken: raw.refreshToken,
  };
}

// ─── Profile mappers ─────────────────────────────────────────────────────────

export function mapStudentProfile(raw: Record<string, unknown>): StudentProfile {
  const skills = Array.isArray(raw.skills)
    ? (raw.skills as Array<string | { skill?: { name: string }; name?: string }>)
        .map((s) =>
          typeof s === "string" ? s : s.skill?.name ?? s.name ?? ""
        )
        .filter(Boolean)
    : [];

  const linksRaw = raw.links as Record<string, string | undefined> | undefined;

  const firstName = (raw.firstName as string) ?? "";
  const lastName = (raw.lastName as string) ?? "";
  const fullName =
    (raw.fullName as string) ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    "Student";

  return {
    userId: (raw.userId as string) ?? "",
    fullName,
    bio: (raw.bio as string) ?? "",
    skills,
    links: {
      github:
        linksRaw?.github ?? (raw.githubUrl as string) ?? undefined,
      linkedin:
        linksRaw?.linkedin ?? (raw.linkedinUrl as string) ?? undefined,
      portfolio:
        linksRaw?.portfolio ?? (raw.portfolioUrl as string) ?? undefined,
    },
    photoUrl: (raw.avatarUrl as string) ?? (raw.photoUrl as string),
    cvUrl: raw.cvUrl as string | undefined,
    verificationStatus: mapVerificationStatus(
      (raw.verificationStatus as string) ?? "PENDING"
    ),
    rejectionReason: raw.rejectionReason as string | undefined,
    cohortYear: (raw.cohortYear as number) ?? new Date().getFullYear(),
    availability: [],
    isVisible: (raw.isVisible as boolean) ?? true,
    updatedAt: toIso(raw.updatedAt as string | Date),
  };
}

export function mapCompanyProfile(raw: Record<string, unknown>): CompanyProfile {
  return {
    userId: (raw.userId as string) ?? "",
    companyName: (raw.companyName as string) ?? "",
    logoUrl: (raw.logoUrl as string) ?? undefined,
    description: (raw.description as string) ?? "",
    industry: (raw.industry as string) ?? "",
    website: (raw.websiteUrl as string) ?? (raw.website as string),
    verificationStatus: mapVerificationStatus(
      (raw.verificationStatus as string) ?? "PENDING"
    ),
    rejectionReason: raw.rejectionReason as string | undefined,
    updatedAt: toIso(raw.updatedAt as string | Date),
  };
}

export function mapStudentWithUser(raw: Record<string, unknown>): StudentWithUser {
  const user = raw.user
    ? mapUser(raw.user as BackendUser)
    : mapUser({ id: raw.userId as string, email: "", role: "STUDENT", createdAt: new Date() });
  return {
    ...mapStudentProfile(raw),
    user,
  };
}

export function mapCompanyWithUser(raw: Record<string, unknown>): CompanyWithUser {
  const user = raw.user
    ? mapUser(raw.user as BackendUser)
    : mapUser({ id: raw.userId as string, email: "", role: "COMPANY", createdAt: new Date() });
  return {
    ...mapCompanyProfile(raw),
    user,
  };
}

// ─── Contact request mappers ─────────────────────────────────────────────────

export function mapContactRequest(raw: BackendContactRequest): ContactRequest {
  const companyId =
    mapRole(raw.sender.role) === "company" ? raw.sender.id : raw.receiver.id;
  const studentId =
    mapRole(raw.receiver.role) === "student" ? raw.receiver.id : raw.sender.id;

  const status = mapContactStatus(raw.status);
  const updatedAt = raw.updatedAt ? toIso(raw.updatedAt) : undefined;

  return {
    id: raw.id,
    companyId,
    studentId,
    status,
    message: raw.message,
    createdAt: toIso(raw.createdAt),
    respondedAt:
      status !== "pending" && updatedAt ? updatedAt : undefined,
  };
}

export function mapContactRequestWithDetails(
  raw: BackendContactRequest,
  extras?: {
    companyProfile?: Record<string, unknown>;
    studentProfile?: Record<string, unknown>;
  }
): ContactRequestWithDetails {
  const base = mapContactRequest(raw);
  const result: ContactRequestWithDetails = { ...base };

  if (extras?.companyProfile) {
    const company = mapCompanyProfile(extras.companyProfile);
    result.company = {
      ...company,
      user: mapUser(
        (extras.companyProfile.user as BackendUser) ?? {
          id: company.userId,
          email: raw.sender.email,
          role: "COMPANY",
          createdAt: new Date(),
        }
      ),
    };
  } else if (mapRole(raw.sender.role) === "company") {
    result.company = {
      userId: raw.sender.id,
      companyName: raw.sender.companyName ?? "Company",
      description: "",
      industry: "",
      verificationStatus: "approved",
      updatedAt: toIso(raw.createdAt),
      user: mapUser({ ...raw.sender, role: "COMPANY" }),
    };
  }

  if (extras?.studentProfile) {
    const student = mapStudentProfile(extras.studentProfile);
    result.student = {
      ...student,
      user: mapUser(
        (extras.studentProfile.user as BackendUser) ?? {
          id: student.userId,
          email: raw.receiver.email,
          role: "STUDENT",
          createdAt: new Date(),
        }
      ),
    };
  } else if (mapRole(raw.receiver.role) === "student") {
    const name = [raw.receiver.firstName, raw.receiver.lastName]
      .filter(Boolean)
      .join(" ");
    result.student = {
      userId: raw.receiver.id,
      fullName: name || "Student",
      bio: "",
      skills: [],
      links: {},
      verificationStatus: "approved",
      cohortYear: new Date().getFullYear(),
      availability: [],
      isVisible: true,
      updatedAt: toIso(raw.createdAt),
      user: mapUser({ ...raw.receiver, role: "STUDENT" }),
    };
  }

  return result;
}

export function mapStudentUpdateToBackend(
  data: Record<string, unknown>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (typeof data.fullName === "string") {
    const parts = data.fullName.trim().split(/\s+/);
    body.firstName = parts[0];
    body.lastName = parts.slice(1).join(" ") || parts[0];
  }
  if (data.bio !== undefined) body.bio = data.bio;
  if (data.photoUrl !== undefined) body.avatarUrl = data.photoUrl || undefined;
  if (data.cvUrl !== undefined) body.cvUrl = data.cvUrl || undefined;
  if (data.cohortYear !== undefined) body.cohortYear = data.cohortYear;
  if (data.isVisible !== undefined) body.isVisible = data.isVisible;

  const links = data.links as Record<string, string | undefined> | undefined;
  if (links) {
    if (links.github) body.githubUrl = links.github;
    if (links.linkedin) body.linkedinUrl = links.linkedin;
    if (links.portfolio) body.portfolioUrl = links.portfolio;
  }

  return body;
}

export function mapCompanyUpdateToBackend(
  data: Record<string, unknown>
): Record<string, unknown> {
  const body: Record<string, unknown> = { ...data };
  if (data.website !== undefined) {
    body.websiteUrl = data.website;
    delete body.website;
  }
  return body;
}


export function mapInterview(raw: Record<string, unknown>): InterviewInvitation {
  const companyProfile = raw.companyProfile as Record<string, unknown> | undefined;
  const studentProfile = raw.studentProfile as Record<string, unknown> | undefined;

  return {
    id: raw.id as string,
    companyId:
      (companyProfile?.userId as string) ??
      (raw.companyId as string) ??
      "",
    studentId:
      (studentProfile?.userId as string) ??
      (raw.studentId as string) ??
      "",
    jobId: (raw.projectId as string) ?? (raw.jobId as string),
    scheduledAt: toIso(raw.scheduledAt as string | Date),
    location: (raw.location as string) ?? "",
    message: (raw.message as string) ?? "",
    status: mapInterviewStatus((raw.status as string) ?? "PENDING"),
    createdAt: toIso(raw.createdAt as string | Date),
  };
}
