export type UserRole = "student" | "company" | "admin";

export type VerificationStatus = "pending" | "approved" | "rejected";

export type ContactRequestStatus = "pending" | "accepted" | "declined";

export type Availability = "internship" | "freelance" | "full-time";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
}

export interface StudentLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface StudentProfile {
  userId: string;
  fullName: string;
  bio: string;
  skills: string[];
  links: StudentLinks;
  photoUrl?: string;
  cvUrl?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  cohortYear: number;
  availability: Availability[];
  isVisible: boolean;
  updatedAt: string;
}

export interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  techStack: string[];
  links: { demo?: string; repo?: string };
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfile {
  userId: string;
  companyName: string;
  logoUrl?: string;
  description: string;
  industry: string;
  website?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  updatedAt: string;
}

export interface ContactRequest {
  id: string;
  companyId: string;
  studentId: string;
  status: ContactRequestStatus;
  message: string;
  createdAt: string;
  respondedAt?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: "student" | "company" | "contact_request" | "project" | "message";
  targetId: string;
  reason?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "verification" | "contact_request" | "system" | "contract";
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterStudentData {
  email: string;
  password: string;
  fullName: string;
  cohortYear: number;
}

export interface RegisterCompanyData {
  email: string;
  password: string;
  companyName: string;
  industry: string;
}

export interface PlatformMetrics {
  totalStudents: number;
  approvedStudents: number;
  pendingStudents: number;
  rejectedStudents: number;
  totalCompanies: number;
  totalContactRequests: number;
  requestsByStatus: Record<ContactRequestStatus, number>;
}

export interface StudentWithUser extends StudentProfile {
  user: User;
}

export interface CompanyWithUser extends CompanyProfile {
  user: User;
}

export interface ContactRequestWithDetails extends ContactRequest {
  company?: CompanyProfile & { user: User };
  student?: StudentProfile & { user: User };
}

export interface Certification {
  id: string;
  studentId: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  imageUrl?: string;
}

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  date: string;
}

export type JobType = "internship" | "full-time" | "freelance";

export interface JobPosting {
  id: string;
  companyId: string;
  title: string;
  description: string;
  type: JobType;
  location: string;
  skills: string[];
  status: "open" | "closed";
  createdAt: string;
}

export type InterviewStatus = "pending" | "accepted" | "declined" | "completed";

export interface InterviewInvitation {
  id: string;
  companyId: string;
  studentId: string;
  jobId?: string;
  scheduledAt: string;
  location: string;
  message: string;
  status: InterviewStatus;
  createdAt: string;
}

export type ContractStatus =
  | "draft"
  | "pending_student"
  | "pending_company"
  | "signed"
  | "declined"
  | "void";

export interface ContractSignature {
  userId: string;
  signerName: string;
  signedAt: string;
  signatureData: string;
  method: "drawn" | "typed";
}

export interface Contract {
  id: string;
  companyId: string;
  studentId: string;
  jobId?: string;
  interviewId?: string;
  title: string;
  role: string;
  startDate: string;
  compensation: string;
  terms: string;
  status: ContractStatus;
  companySignature?: ContractSignature;
  studentSignature?: ContractSignature;
  createdAt: string;
  updatedAt: string;
}

export interface ContractWithDetails extends Contract {
  company?: CompanyProfile & { user: User };
  student?: StudentProfile & { user: User };
  job?: JobPosting;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: [string, string];
  lastMessage: string;
  updatedAt: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  targetType: "student" | "company" | "project" | "message";
  targetId: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export interface CareerAnalytics {
  profileViews: { week: string; views: number }[];
  contactRequestRate: number;
  profileCompleteness: number;
  topSkills: string[];
  responseRate: number;
}

export interface RecruitmentMetrics {
  openJobs: number;
  totalApplications: number;
  interviewsScheduled: number;
  hires: number;
  bookmarkedCandidates: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
  updatedAt: string;
}

export interface BlogSubscriber {
  id: string;
  email: string;
  userId?: string;
  active: boolean;
  subscribedAt: string;
}

export type PortfolioTheme = "classic" | "modern" | "minimal";

export interface PortfolioSections {
  about: boolean;
  skills: boolean;
  projects: boolean;
  certifications: boolean;
  achievements: boolean;
}

export interface PortfolioConfig {
  studentId: string;
  slug: string;
  tagline: string;
  theme: PortfolioTheme;
  sections: PortfolioSections;
  projectOrder: string[];
  certificationOrder: string[];
  achievementOrder: string[];
  isPublished: boolean;
  updatedAt: string;
}

export interface PublicPortfolio {
  config: PortfolioConfig;
  profile: StudentProfile;
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
}
