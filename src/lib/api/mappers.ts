import type {
  Achievement,
  AuthSession,
  Certification,
  CompanyProfile,
  CompanyWithUser,
  ContactRequest,
  ContactRequestStatus,
  ContactRequestWithDetails,
  InterviewInvitation,
  InterviewStatus,
  PortfolioConfig,
  PortfolioSections,
  PortfolioTheme,
  Project,
  PublicPortfolio,
  StudentProfile,
  StudentWithUser,
  User,
  UserRole,
  VerificationStatus,
} from "@/types";
import { debugProfile } from "@/lib/debug/profile-debug";
import { resolveMediaUrl } from "@/lib/config/env";

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
  APPROVED: "approved",
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
  const normalized = status.toLowerCase();
  if (normalized === "approved" || normalized === "verified") return "approved";
  if (normalized === "rejected") return "rejected";
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

function toDateOnly(value: string | Date | undefined): string {
  if (!value) return "";
  const iso = typeof value === "string" ? value : value.toISOString();
  return iso.slice(0, 10);
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

  const availabilityRaw = raw.availability ?? raw.preferredJobTypes;
  const availability = Array.isArray(availabilityRaw)
    ? availabilityRaw
        .map(String)
        .filter((value): value is import("@/types").Availability =>
          ["internship", "freelance", "full-time"].includes(value)
        )
    : [];

  const mapped: StudentProfile = {
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
    photoUrl: resolveMediaUrl(
      (raw.avatarUrl as string) ?? (raw.photoUrl as string)
    ),
    cvUrl: resolveMediaUrl(raw.cvUrl as string | undefined),
    verificationStatus: mapVerificationStatus(
      (raw.verificationStatus as string) ?? "PENDING"
    ),
    rejectionReason: raw.rejectionReason as string | undefined,
    cohortYear:
      typeof raw.cohortYear === "number" && raw.cohortYear >= 2020
        ? raw.cohortYear
        : new Date().getFullYear(),
    availability,
    isVisible: (raw.isVisible as boolean) ?? true,
    updatedAt: toIso(raw.updatedAt as string | Date),
  };

  debugProfile("mapStudentProfile", {
    raw: {
      cohortYear: raw.cohortYear,
      cvUrl: raw.cvUrl,
      githubUrl: raw.githubUrl,
      linkedinUrl: raw.linkedinUrl,
      portfolioUrl: raw.portfolioUrl,
      preferredJobTypes: raw.preferredJobTypes,
      availability: raw.availability,
      links: raw.links,
    },
    mapped: {
      cohortYear: mapped.cohortYear,
      cvUrl: mapped.cvUrl,
      links: mapped.links,
      availability: mapped.availability,
    },
  });

  return mapped;
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
  if (data.photoUrl !== undefined) body.avatarUrl = data.photoUrl || null;
  if (data.cvUrl !== undefined) body.cvUrl = data.cvUrl || null;
  if (data.cohortYear !== undefined) body.cohortYear = data.cohortYear;
  if (data.isVisible !== undefined) body.isVisible = data.isVisible;

  const links = data.links as Record<string, string | undefined> | undefined;
  if (links) {
    body.githubUrl = links.github ? links.github : null;
    body.linkedinUrl = links.linkedin ? links.linkedin : null;
    body.portfolioUrl = links.portfolio ? links.portfolio : null;
  }

  if (data.availability !== undefined) {
    const availability = data.availability as string[];
    body.preferredJobTypes = availability;
    body.availabilityStatus =
      availability.length > 0 ? "AVAILABLE" : "NOT_LOOKING";
  }

  debugProfile("mapStudentUpdateToBackend", { input: data, output: body });

  return body;
}

// ─── Job mappers ─────────────────────────────────────────────────────────────

function inferJobType(
  raw: Record<string, unknown>
): import("@/types").JobType {
  if (raw.type === "internship" || raw.type === "full-time" || raw.type === "freelance") {
    return raw.type;
  }
  const title = String(raw.title ?? "").toLowerCase();
  if (title.includes("intern")) return "internship";
  if (title.includes("freelance") || title.includes("contract")) return "freelance";
  return "full-time";
}

export function mapJobPosting(
  raw: Record<string, unknown>,
  companyId?: string
): import("@/types").JobPosting {
  const skills = Array.isArray(raw.skills)
    ? (raw.skills as Array<string | { skill?: { name: string } }>)
        .map((s) => (typeof s === "string" ? s : s.skill?.name ?? ""))
        .filter(Boolean)
    : [];

  const companyProfile = raw.companyProfile as
    | Record<string, unknown>
    | undefined;
  const count = raw._count as { applications?: number } | undefined;

  return {
    id: raw.id as string,
    companyId:
      companyId ??
      (raw.companyId as string) ??
      (companyProfile?.userId as string) ??
      "",
    companyName: (companyProfile?.companyName as string | undefined) ?? undefined,
    title: (raw.title as string) ?? "",
    description: (raw.description as string) ?? "",
    type: inferJobType(raw),
    location: (raw.location as string) ?? "",
    skills,
    status: raw.isActive === false || raw.status === "closed" ? "closed" : "open",
    compensation: (raw.compensation as string | undefined) ?? undefined,
    isRemote: Boolean(raw.isRemote),
    applicationCount:
      typeof count?.applications === "number"
        ? count.applications
        : typeof raw.applicationCount === "number"
          ? (raw.applicationCount as number)
          : undefined,
    createdAt: toIso(raw.createdAt as string | Date),
  };
}

export function mapJobApplication(
  raw: Record<string, unknown>
): import("@/types").JobApplication {
  const project = (raw.project ?? raw.job) as Record<string, unknown> | undefined;
  const studentProfile = (raw.studentProfile ?? raw.student) as
    | Record<string, unknown>
    | undefined;
  const statusRaw = String(raw.status ?? "APPLIED").toLowerCase();
  const statusMap: Record<string, import("@/types").JobApplicationStatus> = {
    applied: "applied",
    under_review: "under_review",
    underreview: "under_review",
    accepted: "accepted",
    rejected: "rejected",
    withdrawn: "withdrawn",
  };

  return {
    id: String(raw.id ?? ""),
    jobId: String(raw.projectId ?? raw.jobId ?? project?.id ?? ""),
    studentId: String(raw.studentId ?? studentProfile?.userId ?? ""),
    coverLetter: (raw.coverLetter as string | undefined) ?? undefined,
    status: statusMap[statusRaw] ?? "applied",
    createdAt: toIso(raw.createdAt as string | Date),
    reviewedAt: raw.reviewedAt
      ? toIso(raw.reviewedAt as string | Date)
      : undefined,
    job: project ? mapJobPosting(project) : undefined,
    student: studentProfile ? mapStudentProfile(studentProfile) : undefined,
  };
}

export function mapJobToBackend(
  data: Record<string, unknown>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (data.title !== undefined) body.title = data.title;
  if (data.description !== undefined) body.description = data.description;
  if (data.location !== undefined) body.location = data.location;
  if (data.status !== undefined) body.status = data.status;
  return body;
}

// ─── Contract mappers ────────────────────────────────────────────────────────

export function mapContractStatus(
  status: string
): import("@/types").ContractStatus {
  const map: Record<string, import("@/types").ContractStatus> = {
    DRAFT: "draft",
    PENDING_STUDENT: "pending_student",
    PENDING_COMPANY: "pending_company",
    SIGNED: "signed",
    DECLINED: "declined",
    VOID: "void",
  };
  return map[status.toUpperCase()] ?? "draft";
}

export function mapContract(
  raw: Record<string, unknown>,
  ids?: { companyId?: string; studentId?: string }
): import("@/types").Contract {
  const companyProfile = raw.companyProfile as Record<string, unknown> | undefined;
  const studentProfile = raw.studentProfile as Record<string, unknown> | undefined;

  const startDateRaw = raw.startDate as string | Date;
  const startDate = startDateRaw
    ? toIso(startDateRaw).split("T")[0]
    : new Date().toISOString().split("T")[0];

  return {
    id: raw.id as string,
    companyId:
      ids?.companyId ??
      (companyProfile?.userId as string) ??
      (raw.companyId as string) ??
      "",
    studentId:
      ids?.studentId ??
      (studentProfile?.userId as string) ??
      (raw.studentId as string) ??
      "",
    jobId: (raw.projectId as string) ?? (raw.jobId as string) ?? undefined,
    interviewId: (raw.interviewId as string) ?? undefined,
    title: (raw.title as string) ?? "",
    role: (raw.role as string) ?? "",
    startDate,
    compensation: (raw.compensation as string) ?? "",
    terms: (raw.terms as string) ?? "",
    status: mapContractStatus((raw.status as string) ?? "DRAFT"),
    companySignature: raw.companySignature as
      | import("@/types").ContractSignature
      | undefined,
    studentSignature: raw.studentSignature as
      | import("@/types").ContractSignature
      | undefined,
    createdAt: toIso(raw.createdAt as string | Date),
    updatedAt: toIso(raw.updatedAt as string | Date),
  };
}

export function mapContractWithDetails(
  raw: Record<string, unknown>,
  ids?: { companyId?: string; studentId?: string }
): import("@/types").ContractWithDetails {
  const contract = mapContract(raw, ids);
  const result: import("@/types").ContractWithDetails = { ...contract };

  const companyProfile = raw.companyProfile as Record<string, unknown> | undefined;
  const studentProfile = raw.studentProfile as Record<string, unknown> | undefined;
  const project = raw.project as Record<string, unknown> | undefined;

  if (companyProfile) {
    result.company = {
      ...mapCompanyProfile(companyProfile),
      user: companyProfile.user
        ? mapUser(companyProfile.user as BackendUser)
        : mapUser({
            id: contract.companyId,
            email: "",
            role: "COMPANY",
            createdAt: new Date(),
          }),
    };
  }

  if (studentProfile) {
    result.student = {
      ...mapStudentProfile(studentProfile),
      user: studentProfile.user
        ? mapUser(studentProfile.user as BackendUser)
        : mapUser({
            id: contract.studentId,
            email: "",
            role: "STUDENT",
            createdAt: new Date(),
          }),
    };
  }

  if (project) {
    result.job = mapJobPosting(project, contract.companyId);
  }

  return result;
}

export function mapContractToBackend(
  data: Record<string, unknown>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (data.companyId !== undefined) body.companyId = data.companyId;
  if (data.studentId !== undefined) body.studentId = data.studentId;
  if (data.jobId !== undefined) body.jobId = data.jobId;
  if (data.title !== undefined) body.title = data.title;
  if (data.role !== undefined) body.role = data.role;
  if (data.startDate !== undefined) body.startDate = data.startDate;
  if (data.compensation !== undefined) body.compensation = data.compensation;
  if (data.terms !== undefined) body.terms = data.terms;
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

/** Map backend StudentProject → frontend Project shape. */
export function mapProject(
  raw: Record<string, unknown>,
  studentUserId: string,
): Project {
  const nestedLinks = raw.links as { demo?: string; repo?: string } | undefined;

  return {
    id: String(raw.id ?? ""),
    studentId: studentUserId,
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    techStack: Array.isArray(raw.techStack)
      ? raw.techStack.map(String)
      : [],
    links: {
      demo:
        (raw.demoUrl as string | undefined) ??
        nestedLinks?.demo ??
        undefined,
      repo:
        (raw.repoUrl as string | undefined) ??
        nestedLinks?.repo ??
        undefined,
    },
    images: Array.isArray(raw.images) ? raw.images.map(String) : [],
    createdAt: toIso(raw.createdAt as string | Date),
    updatedAt: toIso(raw.updatedAt as string | Date),
  };
}

/** Map frontend project payload → backend create/update body. */
export function mapProjectToBackend(data: {
  title?: string;
  description?: string;
  techStack?: string[];
  links?: Project["links"];
  images?: string[];
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (data.title !== undefined) body.title = data.title;
  if (data.description !== undefined) body.description = data.description;
  if (data.techStack !== undefined) body.techStack = data.techStack;
  if (data.images !== undefined) body.images = data.images;

  if (data.links !== undefined) {
    body.demoUrl = data.links.demo ?? null;
    body.repoUrl = data.links.repo ?? null;
  }

  return body;
}

export function mapCertification(
  raw: Record<string, unknown>,
  studentUserId: string,
): Certification {
  return {
    id: String(raw.id ?? ""),
    studentId: studentUserId,
    title: String(raw.title ?? ""),
    issuer: String(raw.issuer ?? ""),
    issueDate: toDateOnly(raw.issueDate as string | Date | undefined),
    credentialUrl: (raw.credentialUrl as string | undefined) ?? undefined,
    imageUrl: (raw.imageUrl as string | undefined) ?? undefined,
  };
}

export function mapAchievement(
  raw: Record<string, unknown>,
  studentUserId: string,
): Achievement {
  return {
    id: String(raw.id ?? ""),
    studentId: studentUserId,
    title: String(raw.title ?? ""),
    organization: String(raw.organization ?? ""),
    description: String(raw.description ?? ""),
    date: toDateOnly(raw.date as string | Date | undefined),
  };
}

export function mapAchievementToBackend(data: {
  title?: string;
  organization?: string;
  description?: string;
  date?: string;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (data.title !== undefined) body.title = data.title;
  if (data.organization !== undefined) body.organization = data.organization;
  if (data.description !== undefined) body.description = data.description;
  if (data.date !== undefined) body.date = data.date;

  return body;
}

// ─── Portfolio mappers ───────────────────────────────────────────────────────

const DEFAULT_PORTFOLIO_SECTIONS: PortfolioSections = {
  about: true,
  skills: true,
  projects: true,
  certifications: true,
  achievements: true,
};

function sectionVisible(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (value && typeof value === "object" && "visible" in value) {
    return Boolean((value as { visible: unknown }).visible);
  }
  return fallback;
}

export function mapPortfolioSections(raw: unknown): PortfolioSections {
  const sections =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    about: sectionVisible(sections.about, DEFAULT_PORTFOLIO_SECTIONS.about),
    skills: sectionVisible(sections.skills, DEFAULT_PORTFOLIO_SECTIONS.skills),
    projects: sectionVisible(
      sections.projects,
      DEFAULT_PORTFOLIO_SECTIONS.projects
    ),
    certifications: sectionVisible(
      sections.certifications,
      DEFAULT_PORTFOLIO_SECTIONS.certifications
    ),
    achievements: sectionVisible(
      sections.achievements,
      DEFAULT_PORTFOLIO_SECTIONS.achievements
    ),
  };
}

export function mapPortfolioConfig(
  raw: Record<string, unknown>,
  studentUserId?: string
): PortfolioConfig {
  const profile = raw.studentProfile as Record<string, unknown> | undefined;
  const themeRaw = String(raw.theme ?? "modern");
  const theme: PortfolioTheme = (
    ["classic", "modern", "minimal"] as PortfolioTheme[]
  ).includes(themeRaw as PortfolioTheme)
    ? (themeRaw as PortfolioTheme)
    : "modern";

  return {
    studentId:
      studentUserId ??
      (raw.studentId as string | undefined) ??
      (profile?.userId as string | undefined) ??
      "",
    slug: String(raw.slug ?? ""),
    tagline: String(raw.tagline ?? ""),
    theme,
    sections: mapPortfolioSections(raw.sections),
    projectOrder: Array.isArray(raw.projectOrder)
      ? raw.projectOrder.map(String)
      : [],
    certificationOrder: Array.isArray(raw.certificationOrder)
      ? raw.certificationOrder.map(String)
      : [],
    achievementOrder: Array.isArray(raw.achievementOrder)
      ? raw.achievementOrder.map(String)
      : [],
    isPublished: Boolean(raw.isPublished),
    updatedAt: toIso(raw.updatedAt as string | Date),
  };
}

function orderByIds<T extends { id: string }>(items: T[], order: string[]): T[] {
  const ids = order.length ? order : items.map((item) => item.id);
  const sorted = ids
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean) as T[];
  return [...sorted, ...items.filter((item) => !ids.includes(item.id))];
}

/** Map backend GET /portfolio/:slug (or already-shaped payload) → PublicPortfolio. */
export function mapPublicPortfolio(
  raw: Record<string, unknown>
): PublicPortfolio | null {
  // Already nested frontend shape
  if (raw.config && raw.profile) {
    const config = mapPortfolioConfig(raw.config as Record<string, unknown>);
    const profile = mapStudentProfile(raw.profile as Record<string, unknown>);
    const studentId = profile.userId || config.studentId;
    return {
      config: { ...config, studentId },
      profile,
      projects: Array.isArray(raw.projects)
        ? (raw.projects as Record<string, unknown>[]).map((p) =>
            mapProject(p, studentId)
          )
        : [],
      certifications: Array.isArray(raw.certifications)
        ? (raw.certifications as Record<string, unknown>[]).map((c) =>
            mapCertification(c, studentId)
          )
        : [],
      achievements: Array.isArray(raw.achievements)
        ? (raw.achievements as Record<string, unknown>[]).map((a) =>
            mapAchievement(a, studentId)
          )
        : [],
    };
  }

  // Prisma PortfolioConfig + nested studentProfile
  const studentProfile = raw.studentProfile as Record<string, unknown> | undefined;
  if (!studentProfile) return null;

  if (raw.isPublished === false) return null;

  const profile = mapStudentProfile(studentProfile);
  if (profile.verificationStatus !== "approved") return null;

  const studentId = profile.userId;
  const config = mapPortfolioConfig(raw, studentId);

  const projects = orderByIds(
    Array.isArray(studentProfile.projects)
      ? (studentProfile.projects as Record<string, unknown>[]).map((p) =>
          mapProject(p, studentId)
        )
      : [],
    config.projectOrder
  );
  const certifications = orderByIds(
    Array.isArray(studentProfile.certifications)
      ? (studentProfile.certifications as Record<string, unknown>[]).map((c) =>
          mapCertification(c, studentId)
        )
      : [],
    config.certificationOrder
  );
  const achievements = orderByIds(
    Array.isArray(studentProfile.achievements)
      ? (studentProfile.achievements as Record<string, unknown>[]).map((a) =>
          mapAchievement(a, studentId)
        )
      : [],
    config.achievementOrder
  );

  return { config, profile, projects, certifications, achievements };
}
